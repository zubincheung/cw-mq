// Create by Zubin on 2018-07-16 12:04:00

const defaultExchangeOption = {
  durable: false,
  autoDelete: false,
  type: 'direct',
};

const defaultQueueOption = {
  durable: true,
  autoDelete: false,
};
Object.freeze(defaultExchangeOption);
Object.freeze(defaultQueueOption);

module.exports.getOptions = function(options) {
  options.exchangeOption = Object.assign({}, defaultExchangeOption, options.exchangeOption);
  options.queueOption = Object.assign({}, defaultQueueOption, options.queueOption);

  return options;
};
