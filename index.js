// Create by Zubin on 2018-07-16 10:08:49

const amqp = require('amqplib');
const Debug = require('debug');

const { getConnOptions } = require('./lib/url');
const { getOptions } = require('./lib/options');

let debug = Debug('cw-rabbitmq:');

const INIT_CHANNEL = Symbol('MQ#INIT_CHANNEL');
const INIT_CONN = Symbol('MQ#INIT_CONN');
const GET_CONN = Symbol('MQ#GET_CONN');

const CONN = Symbol('MQ#CONN');
const CONNOPTION = Symbol('MQ#CONNOPTION');
const OPTIONS = Symbol('MQ#OPTIONS');

const pool = {};

class MQ {
  static getInstance(connOptions, options) {
    if (!this[options.queueName || 'instance']) {
      this[options.queueName || 'instance'] = new MQ(connOptions, options);
    }

    return this[options.queueName || 'instance'];
  }

  constructor(connOptions, options) {
    this[CONNOPTION] = getConnOptions(connOptions);
    this[OPTIONS] = getOptions(options);

    this.queueName = this[OPTIONS].queueName;

    this[INIT_CONN]();
  }

  /**
   * 初始化channel
   *
   * @returns
   * @memberof MQ
   */
  async [INIT_CHANNEL]() {
    try {
      const conn = await this[GET_CONN]();

      debug('create channel');
      const ch = await conn.createChannel();

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
      if (pool[this.queueName]) {
        await pool[this.queueName].close();
        pool[this.queueName] = null;
      }
      if (pool[CONN]) {
        await pool[CONN].close();
        pool[CONN] = null;
      }
      throw err;
    }
  }

  async [INIT_CONN]() {
    if (!pool[CONN]) {
      debug(`connect rabbitmq, params：`, this[CONNOPTION]);
      pool[CONN] = await amqp.connect(this[CONNOPTION]);

      console.info(`${this[OPTIONS].queueName} connecting!`);

      pool[CONN].on('error', function(err) {
        pool[CONN].close();
      });
    }
  }

  async [GET_CONN]() {
    const self = this;
    return new Promise(resolve => {
      if (!pool[CONN]) {
        setTimeout(() => {
          resolve(self[GET_CONN]());
        }, 100);
        return;
      }
      resolve(pool[CONN]);
    });
  }

  /**
   * 发布消息
   *
   * @param {*} body
   * @param {*} [options={}]
   * @returns
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

    pool[this.queueName] = pool[this.queueName] || (await this[INIT_CHANNEL]());
    const ch = pool[this.queueName];

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
          await ch.ack(msg);
        } catch (error) {
          console.error(error);
          pool[this.queueName] = null;
          await ch.close();
        }
      },
      { noAck: false, ...options },
    );
  }
}

module.exports = MQ;
