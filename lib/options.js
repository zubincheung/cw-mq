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

module.exports.parseConnOptions = function(connOptions) {
  return {
    protocol: 'amqp',
    hostname: connOptions.hostname || connOptions.host || 'localhost',
    port: connOptions.port || 5672,
    username: connOptions.username || connOptions.login || 'guest',
    password: connOptions.password || 'guest',
    locale: 'en_US',
    frameMax: 0,
    heartbeat: 0,
    vhost: connOptions.vhost || '/',
  };
};
