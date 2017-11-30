/*
 * Created by Zubin on 2017-10-17 11:32:58
 */

const amqp = require('amqp');

const defaultExchangeOption = {
  type: 'direct',
  autoDelete: false,
  confirm: true,
};

const defaultQueueOption = {
  durable: true,
  autoDelete: false,
};

/**
 * mq类
 */
class MQ {
  /**
   * 实例化mq类
   * 
   * @param {amqp.ConnectionOptions} connOptions 连接配置
   * @param {IMQOptions} options 
   * @memberof MQ
   */
  constructor(connOptions, { exchangeName, exchangeOption, queueName, queueOption }) {
    exchangeOption = Object.assign(defaultExchangeOption, exchangeOption || {});
    queueOption = Object.assign(defaultQueueOption, queueOption);

    const conn = amqp.createConnection(connOptions);

    conn.on('close', () => {
      this.ready = false;
      console.info('rabbitMQ has closed...');
    });

    conn.on('ready', () => {
      this.exchangeSubmit = conn.exchange(exchangeName, exchangeOption);
      this.exchangeSubmit.on('open', () => {
        this.ready = true;
        const queue = conn.queue(queueName, queueOption, _queue => {
          queue.bind(exchangeName, '', () => {
            this.ready = true;
            this.queue = queue;
            this.isConfirm = exchangeOption.confirm || false;
            console.info('rabbitMQ connection success!');
          });
        });
      });
    });

    conn.on('error', (err) => {
      this.ready = false;
      console.info(`rabbitMQ error,${err.toString()}`);
    });

    conn.on('disconnect', () => {
      this.ready = false;
      console.info('rabbitMQ disconnect');
    });
  }

  /**
   * 发布消息
   *
   * @param {any} body
   * @param {any} [options={}]
   * @returns
   * @memberof MQ
   */
  publishMsg(body, options = {}) {
    return new Promise(((resolve, reject) => {
      if (!this.ready || !this.exchangeSubmit) {
        setTimeout(() => {
          resolve(this.publishMsg(body, options));
        }, 1000);
      } else {
        this.exchangeSubmit.publish('', body, options || {}, (ret, err) => {
          if (err) {
            return reject(err);
          }
          return resolve(!ret);
        });
      }
    }));
  }

  /**
 * 接收消息
 *
 * @param {any} options
 * @param {any} callback
 * @memberof MQ
 */
  subscribeAsync(options = {}) {
    return new Promise((resolve, reject) => {
      if (this.queue) {
        if (this.isConfirm) options.ack = true;
        this.queue.subscribe(options, (message, headers, deliveryInfo, ack) => {
          // console.log(message.data.toString(), headers, deliveryInfo);
          try {
            resolve({ message, headers, deliveryInfo, ack });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        setTimeout(() => {
          resolve(this.subscribeAsync(options));
        }, 1000);
      }
    });
  }

  /**
   * 接收消息
   *
   * @param {any} options
   * @param {any} callback
   * @memberof MQ
   */
  subscribe(options = {}, callback) {
    if (this.queue) {
      if (this.isConfirm) options.ack = true;
      this.queue.subscribe(options, callback);
    } else {
      setTimeout(() => {
        this.subscribe(options, callback);
      }, 1000);
    }
  }
}

module.exports = MQ;
