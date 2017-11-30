const MQ = require('../index');
const { expect } = require('chai');

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
  queueName: 'test',
}

const mq = new MQ(connConfig, options);

describe('mq test', () => {
  it('publishMsg:', () => {

    return mq.publishMsg('heartbeat-test').then((result) => {
      expect(result).to.be.true;
    }).catch((err) => {
      expect(err).to.be.null;
    });
  });

  it('subscribeAsync:', () => {
    return mq.subscribeAsync().then((result) => {
      expect(result.message.data.toString()).to.be.eq('heartbeat-test')
      result.ack.acknowledge(true);
    }).catch((err) => {
      expect(err).to.be.null;
    });
  });

  it('subscribe:', done => {
    mq.subscribe((message, headers, deliveryInfo, ack) => {
      expect(message.data.toString()).to.be.eq('heartbeat-test')
      ack.acknowledge(true);
      done();
    });
  });
});
