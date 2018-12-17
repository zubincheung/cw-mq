// Create by Zubin on 2018-07-16 10:08:49

const Debug = require('debug');
const Promise = require('bluebird');

const { getOptions } = require('./lib/options');
const Connection = require('./lib/connection');

const debug = Debug('cw-rabbitmq:MQ');

const OPTIONS = Symbol('MQ#OPTIONS');
const CONN_OPTIONS = Symbol('MQ#CONN_OPTIONS');

/**
 * RabbitMq操作类
 *
 * @class MQ
 */
class MQ {
  constructor(connOptions, options) {
    this[OPTIONS] = getOptions(options);
    this[CONN_OPTIONS] = connOptions;

    this.queueName = this[OPTIONS].queueName;
  }

  /**
   * 初始化channel
   *
   * @memberof MQ
   */
  async createChannel() {
    this.conn = await Connection.connect(this[CONN_OPTIONS]);

    // 建立一个channel
    debug('create channel');
    const ch = await this.conn.createChannel();

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
    await ch.prefetch(10);

    return ch;
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
    const ch = await this.createChannel();

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
   * @param {((msg: Message | null) => any)} onMessage 订阅方法
   * @param {amqp.Options.Consume} [options] 订阅配置
   * @returns {Promise<void>}
   * @memberof MQ
   */
  async subscribe(onMessage, options) {
    const ch = await this.createChannel();
    console.info(`[mq] Waiting in${this[OPTIONS].queueName}...`);

    await ch.consume(
      this[OPTIONS].queueName,
      async msg => {
        const {
          properties: { headers },
        } = msg;

        await onMessage(msg, headers, ch);
      },
      { noAck: false, ...options },
    );
  }
}

module.exports = MQ;
