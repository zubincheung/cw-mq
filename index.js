/*
 * Created by Zubin on 2017-10-17 11:32:58
 */

const amqp = require('amqp');

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
    const that = this;
    const conn = amqp.createConnection(connOptions);

    conn.on('close', () => {
      that.ready = false;
      console.info('rabbitMQ has closed...');
    });

    conn.on('ready', () => {
      that.exchangeSubmit = conn.exchange(exchangeName, exchangeOption);
      that.exchangeSubmit.on('open', () => {
        that.ready = true;
        const queue = conn.queue(queueName, queueOption, _queue => {
          queue.bind(exchangeName, '', () => {
            that.ready = true;
            that.queue = queue;
            console.info('rabbitMQ connection success!');
            that.isConfirm = exchangeOption.confirm || false;
          });
        });
      });
    });

    conn.on('error', (err) => {
      that.ready = false;
      console.log(err);
      console.info(`rabbitMQ error,${err.toString()}`);
    });

    conn.on('disconnect', () => {
      that.ready = false;
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
  async  publishMsg(body, options = {}) {
    // console.log('publish', this.ready);
    const that = this;
    return new Promise(((resolve, reject) => {
      if (!this.ready || !this.exchangeSubmit) {
        setTimeout(() => {
          resolve(that.publishMsg(body, options));
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
  async subscribeAsync(options = {}) {
    const that = this;
    return new Promise((resolve, reject) => {
      if (that.queue) {
        if (that.isConfirm) options.ack = true;
        that.queue.subscribe(options, (message, headers, deliveryInfo, ack) => {
          // console.log(message.data.toString(), headers, deliveryInfo);
          try {
            resolve({ message, headers, deliveryInfo, ack });
          } catch (error) {
            reject(error);
          }
        });
      } else {
        setTimeout(() => {
          resolve(that.subscribe(options));
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
    const that = this;
    if (that.queue) {
      if (that.isConfirm) options.ack = true;
      that.queue.subscribe(options, callback);
    } else {
      setTimeout(() => {
        resolve(that.subscribe(options, callback));
      }, 1000);
    }
  }
}

module.exports = MQ;
