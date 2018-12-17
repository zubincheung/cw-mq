// Create by Zubin on 2018-07-18 14:57:06

const amqp = require('amqplib');
const assert = require('assert');
const Debug = require('debug');

const debug = Debug('cw-rabbitmq:Connection');

const { parseConnOptions } = require('./options');

const INIT = Symbol('Connection#init');

module.exports = class Connection {
  /**
   * 初始化连接
   *
   * @static
   * @param {*} options
   * @return {amqp.Connection}
   */
  static async [INIT](connOptions) {
    const options = parseConnOptions(connOptions);
    debug('connection options', options);

    Connection.connectionName = `${options.hostname}#${options.username}`;

    Connection[Connection.connectionName] = await amqp.connect(options);

    console.log(`RabbitMQ [${Connection.connectionName}] connection success!`);

    return Connection[Connection.connectionName];
  }

  /**
   * 建立连接
   *
   * @static
   * @param {*} connOptions 连接配置
   * @returns {amqp.Connection}
   */
  static async connect(connOptions) {
    assert(connOptions, 'connOptions can not be null');

    if (!Connection.connectionName || !Connection[Connection.connectionName]) {
      return Connection[INIT](connOptions);
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
