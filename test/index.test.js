const MQ = require('../index');
const amqp = require('amqplib');

const connConfig = {};

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
        expect(result).toBeTruthy();
      })
      .catch(err => {
        expect(err).toBeNull();
      });
  });

  it('subscribe:', async () => {
    await mq.subscribe(async (msg, headers, ch) => {
      expect(msg.content.toString()).toBe('heartbeat-test');
      expect(headers).toEqual({});
    });
  });
});
