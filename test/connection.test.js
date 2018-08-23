const Connection = require('../lib/connection');

const assert = require('assert');

const connConfig = {};

describe('Connection test', () => {
  it('getConnection:', async () => {
    const conn = await Connection.connect(connConfig);
    expect(!!conn.isCloseed).toBeFalsy();
    await Connection.close(conn);
    expect(!!conn.isCloseed).toBeTruthy();
  });

  it('connection closed:', async () => {
    const conn = await Connection.connect(connConfig);
    try {
      expect(!!conn.isCloseed).toBeFalsy();
      await Connection.close(conn);
      expect(!!conn.isCloseed).toBeTruthy();
      await Connection.close(conn);
    } catch (error) {
      expect(error).toBeInstanceOf(assert.AssertionError);
    }
  });
});
