const MQ = require('../index');

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
    await mq.subscribe(async (message, headers) => {
      expect(!!message).toBeTruthy();
    });
  });
});
