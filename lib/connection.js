// Create by Zubin on 2018-07-18 14:57:06

const Promise = require('bluebird');
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
    if (!Connection.connectionName) {
      const options = {
        protocol: 'amqp',
        hostname: connOptions.host || 'localhost',
        port: connOptions.port || 5672,
        username: connOptions.login || 'guest',
        password: connOptions.password || 'guest',
        locale: 'en_US',
        channelMax: connOptions.channelMax || 10240,
        frameMax: 0,
        heartbeat: connOptions.heartbeat || 300,
        vhost: connOptions.vhost || '/',
      };
      debug('connection options', options);

      Connection.connectionName = `${options.hostname}#${options.username}`;

      Connection[Connection.connectionName] = await amqp.connect(options);

      console.log(`RabbitMQ [${Connection.connectionName}] connection success!`);

      return Connection[Connection.connectionName];
    }
  }

  static async connect(connOptions) {
    assert(connOptions, 'connOptions can not be null');

    if (!Connection.connectionName) {
      return Connection[INIT](connOptions);
    }

    if (!Connection[Connection.connectionName]) {
      await Promise.delay(100);
      return Connection.connect(connOptions);
    }

    if (Connection[Connection.connectionName].isCloseed) {
      Connection.connectionName = '';
      return Connection.connect(connOptions);
    }

    return Connection[Connection.connectionName];
  }

  static async close(conn) {
    assert(!conn.isCloseed, 'connection is closed');
    await conn.close();
    conn.isCloseed = true;
  }
};
