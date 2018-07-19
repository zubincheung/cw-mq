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
  exchangeName: 'exTest',
  exchangeOption: {
    durable: true,
  },
  queueName: 'test',
};

const mq = new MQ(connConfig, options);

describe('mq test', () => {
  it('publishMsg:', () => {
    return mq
      .publishMsg('heartbeat-test')
      .then(result => {
        expect(result).to.be.true;
      })
      .catch(err => {
        console.log(err);
        expect(err).to.be.null;
      });
  });

  it('subscribe:', () => {
    return mq.subscribe(async (message, headers) => {
      expect(!!message).to.be.true;
    });
  });
});

// for (let i = 0; i < 10000; i++) {
//   new MQ(connConfig, options)
//     .publishMsg('2---' + i)
//     // .then(console.log)
//     .catch(console.error);
// }
