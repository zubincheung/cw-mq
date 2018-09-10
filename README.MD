# rabbitmq 组件

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/cw-rabbitmq.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cw-rabbitmq
[travis-image]: https://img.shields.io/travis/zubincheung/cw-rabbitmq.svg?style=flat-square
[travis-url]: https://travis-ci.org/zubincheung/cw-rabbitmq
[codecov-image]: https://img.shields.io/codecov/c/github/zubincheung/cw-rabbitmq.svg?style=flat-square
[codecov-url]: https://codecov.io/github/zubincheung/cw-rabbitmq?branch=master
[david-image]: https://img.shields.io/david/zubincheung/cw-rabbitmq.svg?style=flat-square
[david-url]: https://david-dm.org/zubincheung/cw-rabbitmq
[snyk-image]: https://snyk.io/test/npm/cw-rabbitmq/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/cw-rabbitmq
[download-image]: https://img.shields.io/npm/dm/cw-rabbitmq.svg?style=flat-square
[download-url]: https://npmjs.org/package/cw-rabbitmq

消息队列组件,推荐[Node](https://nodejs.org)版本 8LTS 以上

## 安装

```shell
npm install --save cw-rabbitmq
```

## 使用方法

```javascript
const connConfig = {
  host: '',
  port: 5672,
  login: '',
  password: '',
  vhost: '',
  reconnect: true,
  reconnectBackoffTime: 10000, // 10秒尝试连接一次
};
const options = {
  exchangeName: 'exTest',
  exchangeOption: {
    // ke选
    type: 'direct',
    autoDelete: false,
    confirm: true,
  },
  queueName: 'test',
  queueOption: {
    // 可选
    durable: true,
    autoDelete: false,
  },
};

const mq = new MQ(connConfig, options);

mq.publishMsg('heartbeat-test')
  .then(result => {
    console.info(`MQ心跳监测正常,result:${result}`);
  })
  .catch(err => {
    console.info(`MQ心跳监测异常${err.toString()}`);
  });

mq.subscribeAsync().then(result => {
  result.ack.acknowledge(true);
});

mq.subscribe((message, headers, deliveryInfo, ack) => {
  ack.acknowledge(true);
});
```
