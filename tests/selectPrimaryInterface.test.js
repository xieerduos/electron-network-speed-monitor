const { selectPrimaryInterface } = require('../main');

describe('selectPrimaryInterface', () => {
  test('returns first active non-virtual interface with data transfer', () => {
    const stats = [
      { iface: 'eth0', operstate: 'down', virtual: false, rx_bytes: 0, tx_bytes: 0 },
      { iface: 'lo', operstate: 'up', virtual: true, rx_bytes: 100, tx_bytes: 100 },
      { iface: 'wifi0', operstate: 'up', virtual: false, rx_bytes: 50, tx_bytes: 60 },
      { iface: 'wifi1', operstate: 'up', virtual: false, rx_bytes: 0, tx_bytes: 0 }
    ];

    const result = selectPrimaryInterface(stats);
    expect(result.iface).toBe('wifi0');
  });

  test('defaults to first interface if none match', () => {
    const stats = [
      { iface: 'eth0', operstate: 'down', virtual: false, rx_bytes: 0, tx_bytes: 0 },
      { iface: 'wifi1', operstate: 'up', virtual: false, rx_bytes: 0, tx_bytes: 0 }
    ];

    const result = selectPrimaryInterface(stats);
    expect(result.iface).toBe('eth0');
  });
});
