const MQ = require('../index');
const { expect } = require('chai');

describe('mq test', () => {
  it('set:', async () => {
    const connConfig = {
      host: '192.168.2.163',
      port: 5672,
      login: 'ciwong2017',
      password: '123456',
      vhost: 'ciwong_vhost',
      reconnect: true,
      reconnectBackoffTime: 10000, // 10秒尝试连接一次
    };
    const options = {
      exchangeName: 'exTest',
      exchangeOption: {
        type: 'direct',
        autoDelete: false,
        confirm: true,
      },
      queueName: 'test',
      queueOption: {
        durable: true,
        autoDelete: false,
      },
    }

    const mq = new MQ(connConfig, options);
    await mq.publishMsg('heartbeat-test').then((result) => {
      console.info(`MQ心跳监测正常,result:${result}`);
    }).catch((err) => {
      console.info(`MQ心跳监测异常${err.toString()}`);
    });
  });
});
