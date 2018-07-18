// Create by Zubin on 2018-07-18 14:57:06

const amqp = require('amqplib');
const assert = require('assert');
const Debug = require('debug');

const debug = Debug('cw-rabbitmq:Connection');

const INIT = Symbol('Connection#init');

module.exports = class Connection {
  /**
   * 初始化连接
   *
   * @static
   * @param {*} options
   */
  static async [INIT](connOptions) {
    if (!Connection.ready) {
      const options = {
        protocol: 'amqp',
        hostname: connOptions.host || 'localhost',
        port: connOptions.port || 5672,
        username: connOptions.login || 'guest',
        password: connOptions.password || 'guest',
        locale: 'en_US',
        frameMax: 0,
        heartbeat: connOptions.heartbeat || 300,
        vhost: connOptions.vhost || '/',
      };
      debug('connection options', options);

      Connection.username = options.username;

      Connection[Connection.username] = await amqp.connect(options);

      console.log(`RabbitMQ [${Connection.username}] connection success!`);

      return Connection[Connection.username];
    }
  }

  static async getConnection(connOptions) {
    assert(connOptions, 'connOptions can not be null');
    return new Promise(resolve => {
      if (!Connection.username) {
        resolve(Connection[INIT](connOptions));
        return;
      }
      if (!Connection[Connection.username]) {
        setTimeout(() => {
          resolve(Connection.getConnection(connOptions));
        }, 100);
        return;
      }
      resolve(Connection[Connection.username]);
    });
  }
};
