const { getOptions } = require('../lib/options');

describe('options test', () => {
  it('getOptions:', () => {
    const options = getOptions({
      exchangeName: 'exTest1',
      exchangeOption: {
        durable: true,
      },
      queueName: 'test1',
    });

    expect(options).toEqual({
      exchangeName: 'exTest1',
      exchangeOption: { durable: true, autoDelete: false, type: 'direct' },
      queueName: 'test1',
      queueOption: { durable: true, autoDelete: false },
    });
  });
});
