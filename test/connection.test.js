const Connection = require('../lib/connection');
const { expect } = require('chai');

const assert = require('assert');

const connConfig = {
  host: '192.168.8.18',
  port: 5672,
  login: 'epaperapi',
  password: '123456',
  vhost: 'epaperapi_dev',
  reconnect: true,
  reconnectBackoffTime: 10000, // 10秒尝试连接一次
};

describe('Connection test', () => {
  it('getConnection:', async () => {
    const conn = await Connection.connect(connConfig);
    expect(!!conn.isCloseed).to.be.false;
    await Connection.close(conn);
    expect(!!conn.isCloseed).to.be.true;
  });

  it('connection closed:', async () => {
    const conn = await Connection.connect(connConfig);
    try {
      expect(!!conn.isCloseed).to.be.false;
      await Connection.close(conn);
      expect(!!conn.isCloseed).to.be.true;
      await Connection.close(conn);
    } catch (error) {
      expect(error).to.instanceof(assert.AssertionError);
    }
  });
});
