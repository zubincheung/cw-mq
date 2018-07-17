// Create by Zubin on 2018-07-16 11:59:17

module.exports.getUrl = function(connOptions) {
  return `amqp://${connOptions.login}:${connOptions.password}@${connOptions.host}/${
    connOptions.vhost
  }`;
};

module.exports.getConnOptions = function(connOptions) {
  return {
    protocol: 'amqp',
    hostname: connOptions.host || 'localhost',
    port: connOptions.port || 5672,
    username: connOptions.login || 'guest',
    password: connOptions.password || 'guest',
    locale: 'en_US',
    frameMax: 0,
    heartbeat: connOptions.heartbeat || 600,
    vhost: connOptions.vhost || '/',
  };
};
