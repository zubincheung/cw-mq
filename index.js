// Create by Zubin on 2018-07-16 10:08:49

const amqp = require('amqplib');
const Debug = require('debug');

const { getUrl } = require('./lib/url');
const { getOptions } = require('./lib/options');

const debug = Debug('cw-rabbitmq:');

const INIR_CHANNEL = Symbol('MQ#INIR_CHANNEL');

const CONN = Symbol('MQ#CONN');
const URL = Symbol('MQ#URL');
const OPTIONS = Symbol('MQ#OPTIONS');
const INSTANCE = Symbol('MQ#INSTANCE');

class MQ {
  /**
   * 获取mq实例
   *
   * @param {amqp.ConnectionOptions} connOptions 连接配置
   * @param {IMQOptions} options
   * @memberof MQ
   */
  static getInstance(connOptions, options) {
    if (!this[INSTANCE]) {
      this[INSTANCE] = new MQ(connOptions, options);
    }
    return this[INSTANCE];
  }

  constructor(connOptions, options) {
    this[URL] = getUrl(connOptions);
    debug('url：', `${this[URL]}`);

    this[OPTIONS] = getOptions(options);
    debug(`options:`, options);

    this[CONN] = null;
    this.instance = null;
  }

  /**
   * 初始化channel
   *
   * @returns
   * @memberof MQ
   */
  async [INIR_CHANNEL]() {
    if (!this[CONN]) this[CONN] = await amqp.connect(this[URL]);

    const ch = await this[CONN].createChannel();

    await ch.assertExchange(
      this[OPTIONS].exchangeName,
      this[OPTIONS].exchangeOption.type,
      this[OPTIONS].exchangeOption,
    );

    await ch.assertQueue(this[OPTIONS].queueName, this[OPTIONS].queueOption);

    await ch.bindQueue(this[OPTIONS].queueName, this[OPTIONS].exchangeName, '');

    return ch;
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
    const ch = await this[INIR_CHANNEL]();
    return ch.publish(this[OPTIONS].exchangeName, '', Buffer.from(body), options);
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

    const ch = await this[INIR_CHANNEL]();

    await ch.consume(
      this[OPTIONS].queueName,
      async msg => {
        const {
          content,
          fields,
          properties: { headers },
        } = msg;

        await fn(content.toString(), headers, fields).catch();
        return ch.ack(msg);
      },
      { noAck: false, ...options },
    );
  }
}

module.exports = MQ;
