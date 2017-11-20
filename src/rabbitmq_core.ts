/*
 * Created by Zubin on 2017-10-17 11:32:58
 */

import * as amqp from 'amqp';

/**
 * mq类
 */
class MQ {
  private ready: boolean;
  private exchangeSubmit: amqp.AMQPExchange;
  private queue: amqp.AMQPQueue;

  constructor(connOptions: amqp.ConnectionOptions, { exchangeName, exchangeOption, queueName, queueOption }) {
    const that = this;
    const conn: amqp.AMQPClient = amqp.createConnection(connOptions);

    conn.on('close', () => {
      that.ready = false;
      console.info('rabbitMQ has closed...');
    });

    conn.on('ready', () => {
      that.exchangeSubmit = conn.exchange(exchangeName, exchangeOption);
      that.exchangeSubmit.on('open', () => {
        that.ready = true;
        const queue: amqp.AMQPQueue = conn.queue(queueName, queueOption, _queue => {
          queue.bind(exchangeName, '', () => {
            that.ready = true;
            that.queue = queue;
            console.info('rabbitMQ connection success!');
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
  public publishMsg(body: string, options = {}) {
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
  public subscribe(options: amqp.SubscribeOptions, callback: amqp.SubscribeCallback) {
    const that = this;
    if (that.queue) {
      that.queue.subscribe(options, callback);
    } else {
      setTimeout(() => {
        that.subscribe(options, callback);
      }, 1000);
    }
  }
}

export default MQ;
