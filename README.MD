# rabbitmq组件
消息队列组件,推荐[Node](https://nodejs.org)版本8LTS以上

## 安装
``` shell
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
      exchangeOption: {  // ke选
        type: 'direct',
        autoDelete: false,
        confirm: true,
      },
      queueName: 'test',
      queueOption: { // 可选
        durable: true,
        autoDelete: false,
      },
    }

    const mq = new MQ(connConfig, options);

    mq.publishMsg('heartbeat-test').then((result) => {
      console.info(`MQ心跳监测正常,result:${result}`);
    }).catch((err) => {
      console.info(`MQ心跳监测异常${err.toString()}`);
    });

    mq.subscribeAsync().then((result) => {
      result.ack.acknowledge(true);
    });

    mq.subscribe((message, headers, deliveryInfo, ack) => {
      ack.acknowledge(true);
    });
```

