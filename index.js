// Create by Zubin on 2018-07-16 10:08:49

const amqp = require('amqplib');
const Debug = require('debug');

const { getConnOptions } = require('./lib/url');
const { getOptions } = require('./lib/options');

let debug = Debug('cw-rabbitmq:');

const INIR_CHANNEL = Symbol('MQ#INIR_CHANNEL');

const CONN = Symbol('MQ#CONN');
const CONNOPTION = Symbol('MQ#CONNOPTION');
const OPTIONS = Symbol('MQ#OPTIONS');

const pool = {};

class MQ {
  constructor(connOptions, options) {
    this[CONNOPTION] = getConnOptions(connOptions);
    this[OPTIONS] = getOptions(options);

    this.queueName = this[OPTIONS].queueName;

    console.info(`${this[OPTIONS].queueName} connecting!`);
  }

  /**
   * 初始化channel
   *
   * @returns
   * @memberof MQ
   */
  async [INIR_CHANNEL]() {
    if (!pool[CONN]) {
      debug(`connect rabbitmq, params：`, this[CONNOPTION]);
      pool[CONN] = await amqp.connect(this[CONNOPTION]);
    }

    debug('create channel');
    const ch = await pool[CONN].createChannel();

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

    pool[this.queueName] = ch;
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
    const ch = pool[this.queueName] || (await this[INIR_CHANNEL]());
    debug(`publish：${this[OPTIONS].exchangeName},msg:${body}`);
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

    const ch = pool[this.queueName] || (await this[INIR_CHANNEL]());

    await ch.consume(
      this[OPTIONS].queueName,
      async msg => {
        debug('consume:', msg);
        const {
          content,
          fields,
          properties: { headers },
        } = msg;

        await fn(content && content.toString(), headers || {}, fields || {}).catch(console.error);
        return ch.ack(msg);
      },
      { noAck: false, ...options },
    );
  }
}

module.exports = MQ;
