// Create by Zubin on 2018-07-18 10:50:54
const MQ = require('../index');
const { expect } = require('chai');

const connConfig = {
  host: '192.168.8.18',
  port: 5672,
  login: 'epaperapi',
  password: '123456',
  vhost: 'epaperapi_dev',
  reconnect: true,
  reconnectBackoffTime: 10000, // 10秒尝试连接一次
};
const options = {
  exchangeName: 'exTest1',
  exchangeOption: {
    durable: true,
  },
  queueName: 'test1',
};

const mq = new MQ(connConfig, options);

for (let i = 0; i < 40000; i++) {
  mq.publishMsg('2---' + i)
    .then(console.log)
    .catch(console.error);
}
