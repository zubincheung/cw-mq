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
  protocol: 'amqp',
  hostname: 'localhost',
  port: 5672,
  username: 'guest',
  password: 'guest',
  locale: 'en_US',
  frameMax: 0,
  heartbeat: 0,
  vhost: '/',
};
const options = {
  exchangeName: 'exTest',
  exchangeOption: {
    // 可选
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

mq.publishMsg('hello world');

mq.subscribe((message, headers, ch) => {
  console.log(message);
});
```
