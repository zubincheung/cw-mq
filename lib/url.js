// Create by Zubin on 2018-07-16 11:59:17

module.exports.getUrl = function(connOptions) {
  return `amqp://${connOptions.login}:${connOptions.password}@${connOptions.host}/${
    connOptions.vhost
  }`;
};
