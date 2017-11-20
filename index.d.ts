import * as amqp from 'amqp';

interface IMQOptions {
  exchangeName: string;
  exchangeOption: amqp.ExchangeOptions;
  queueName: string;
  queueOption: amqp.QueueOptions;
}

/**
 * mq类
 */
declare class MQ {
  private ready;
  private exchangeSubmit;
  private queue;
  constructor(connOptions: amqp.ConnectionOptions, options: IMQOptions);
  /**
   * 发布消息
   *
   * @param {any} body
   * @param {any} [options={}]
   * @returns
   * @memberof MQ
   */
  publishMsg(body: string, options?: {}): Promise<{}>;
  /**
   * 接收消息
   *
   * @param {any} options
   * @param {any} callback
   * @memberof MQ
   */
  subscribe(options: amqp.SubscribeOptions, callback: amqp.SubscribeCallback): void;
}
export default MQ;
