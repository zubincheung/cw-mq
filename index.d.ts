/// <reference types="node" />
import * as amqp from 'amqplib';

declare interface IMQOptions {
  exchangeName: string;
  exchangeOption?: amqp.Options.AssertExchange;
  queueName: string;
  queueOption?: amqp.Options.AssertQueue;
}

declare interface ISubscribeData {
  message: any;
  headers: { [key: string]: any };
  deliveryInfo: amqp.DeliveryInfo;
  ack: amqp.Ack;
}

/**
 * mq类
 */
declare class MQ {
  private ready;
  private exchangeSubmit;
  /**
   * 实例化mq类
   *
   * @param {amqp.ConnectionOptions} connOptions 连接配置
   * @param {IMQOptions} options
   * @memberof MQ
   */
  constructor(connOptions: amqp.ConnectionOptions, options: IMQOptions);

  /**
   * 发布消息
   *
   * @param {any} body
   * @param {any} [options={}]
   * @returns
   * @memberof MQ
   */
  publishMsg(body: string | Buffer, options?: amqp.Options.Publish): Promise<any>;

  /**
   * 接收消息
   *
   * @param {any} options
   * @param {any} callback
   * @memberof MQ
   */
  subscribe(
    options: amqp.Options.Consume,
    callback: (message, headers, fields) => {},
  ): Promise<void>;
  subscribe(callback: (message, headers, fields) => {}): Promise<void>;
}
export = MQ;

declare namespace MQ {

}
