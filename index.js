// Create by Zubin on 2018-07-16 10:08:49
const Promise = require('bluebird');
// const amqp = require('amqplib');
const Debug = require('debug');

const { getOptions } = require('./lib/options');
const Connection = require('./lib/connection');

let debug = Debug('cw-rabbitmq:MQ');

const INIT_CHANNEL = Symbol('MQ#INIT_CHANNEL');
const CONN = Symbol('MQ#CONN');
const OPTIONS = Symbol('MQ#OPTIONS');
const CONN_OPTIONS = Symbol('MQ#CONN_OPTIONS');

class MQ {
  static getInstance(connOptions, options) {
    if (!this[options.queueName || 'instance']) {
      this[options.queueName || 'instance'] = new MQ(connOptions, options);
    }

    return this[options.queueName || 'instance'];
  }

  constructor(connOptions, options) {
    this[OPTIONS] = getOptions(options);
    this[CONN_OPTIONS] = connOptions;

    this.queueName = this[OPTIONS].queueName;
  }

  /**
   * 初始化channel
   *
   * @returns
   * @memberof MQ
   */
  async [INIT_CHANNEL](count = 0) {
    const conn = await Connection.connect(this[CONN_OPTIONS]);
    let ch = null;

    // 建立一个channel,如果创建channel失败,重试100次
    try {
      debug('create channel');
      ch = await conn.createChannel();
    } catch (error) {
      count++;
      await Promise.delay(300);
      if (count < 100) {
        return this[INIT_CHANNEL](count);
      }
      throw error;
    }

    try {
      debug(
        'assertExchange:',
        this[OPTIONS].exchangeName,
        this[OPTIONS].exchangeOption.type,
        this[OPTIONS].exchangeOption,
      );
      await ch.assertExchange(
        this[OPTIONS].exchangeName,
        this[OPTIONS].exchangeOption.type,
        this[OPTIONS].exchangeOption,
      );

      debug('assertQueue:', this[OPTIONS].queueName, this[OPTIONS].queueOption);
      await ch.assertQueue(this[OPTIONS].queueName, this[OPTIONS].queueOption);

      debug('bindQueue', this[OPTIONS].queueName, this[OPTIONS].exchangeName, 'routekey:""');
      await ch.bindQueue(this[OPTIONS].queueName, this[OPTIONS].exchangeName, '');

      return ch;
    } catch (err) {
      // await ch.close();
      await Connection.close(conn);
      throw err;
    }
  }

  /**
   * 发布消息
   *
   * @param {*} body
   * @param {*} [options={}]
   * @returns 是否发送成果
   * @memberof MQ
   */
  async publishMsg(body, options = {}) {
    const ch = await this[INIT_CHANNEL]();

    try {
      debug(`publish：${this[OPTIONS].exchangeName},msg:${body}`);
      return ch.publish(this[OPTIONS].exchangeName, '', Buffer.from(body), options);
    } finally {
      await ch.close();
    }
  }

  /**
   * 订阅消息
   *
   * @param {*} options
   * @param {*} fn
   * @memberof MQ
   */
  async subscribe(options, fn) {
    if (typeof options == 'function') {
      fn = options;
      options = {};
    }

    const ch = await this[INIT_CHANNEL]();

    await ch.consume(
      this[OPTIONS].queueName,
      async msg => {
        debug('consume:', msg);
        const {
          content,
          fields,
          properties: { headers },
        } = msg;

        try {
          await fn(content && content.toString(), headers || {}, fields || {});
        } finally {
          await ch.ack(msg);
        }
      },
      { noAck: false, ...options },
    );
  }
}

module.exports = MQ;
