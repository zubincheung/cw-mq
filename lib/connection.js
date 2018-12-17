/* eslint-disable no-console */
// Create by Zubin on 2018-07-18 14:57:06

const amqp = require('amqplib');
const assert = require('assert');
const Debug = require('debug');
const Promise = require('bluebird');

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

    // 监听连接错误
    Connection[Connection.connectionName].on('close', async () => {
      console.warn(
        `[MQ:${Connection.connectionName}] lost connection, Reconnecting in 10 seconds...!`,
      );

      await Connection.reConnect(connOptions);
    });

    console.log(`[MQ:${Connection.connectionName}] connect success!`);

    return Connection[Connection.connectionName];
  }

  static async reConnect(connOptions, count = 1) {
    if (count > 10) process.exit(0);

    try {
      await Promise.delay(10000);

      console.log(`[MQ:${Connection.connectionName}] Reconnecting count: ${count}`);
      await Connection[INIT](connOptions);
    } catch (error) {
      console.warn(`[MQ:${Connection.connectionName}] connect error: ${error.message}`);
      count++;
      await Connection.reConnect(connOptions, count);
    }
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
