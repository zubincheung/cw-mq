const { getOptions } = require('../lib/options');
const { expect } = require('chai');

describe('options test', () => {
  it('getOptions:', () => {
    const options = getOptions({
      exchangeName: 'exTest',
      exchangeOption: {
        durable: true,
      },
      queueName: 'test',
    });

    expect(options).to.deep.equal({
      exchangeName: 'exTest',
      exchangeOption: { durable: true, autoDelete: false, type: 'direct' },
      queueName: 'test',
      queueOption: { durable: true, autoDelete: false },
    });
  });
});
