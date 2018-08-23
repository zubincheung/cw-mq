/// <reference types="node" />
import * as amqp from 'amqplib';

declare interface IMQOptions {
  exchangeName: string;
  exchangeOption?: amqp.Options.AssertExchange;
  queueName: string;
  queueOption?: amqp.Options.AssertQueue;
}

/**
 * mq类
 */
declare class MQ {
  private ready;
  private exchangeSubmit;

  conn: amqp.Connection;

  /**
   * 实例化mq类
   *
   * @param {amqp.Options.Connect} connOptions 连接配置
   * @param {IMQOptions} options
   * @memberof MQ
   */
  constructor(connOptions: amqp.Options.Connect, options: IMQOptions);

  /**
   *  新建一个channel
   */
  createChannel(): Promise<amqp.Channel>;

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
   * 订阅消息
   *
   * @param {((msg: amqp.Message | null, header: any, ch: amqp.Channel) => any)} onMessage 订阅方法
   * @param {amqp.Options.Consume} [options] 订阅配置
   * @returns {Promise<void>}
   * @memberof MQ
   */
  subscribe(
    onMessage: (msg: amqp.Message | null, header: any, ch: amqp.Channel) => any,
    options?: amqp.Options.Consume,
  ): Promise<void>;
}
export = MQ;

declare namespace MQ {

}
