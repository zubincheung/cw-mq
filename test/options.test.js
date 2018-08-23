const { getOptions } = require('../lib/options');

describe('options test', () => {
  it('getOptions:', () => {
    const options = getOptions({
      exchangeName: 'exTest',
      exchangeOption: {
        durable: true,
      },
      queueName: 'test',
    });

    expect(options).toEqual({
      exchangeName: 'exTest',
      exchangeOption: { durable: true, autoDelete: false, type: 'direct' },
      queueName: 'test',
      queueOption: { durable: true, autoDelete: false },
    });
  });
});
