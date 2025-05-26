// Import the helper we want to test. It is kept in a separate module
// so that main.js (the Electron entry file) doesn't need to export it.
const { selectPrimaryInterface } = require('../networkUtils');

describe('selectPrimaryInterface', () => {
  test('returns first active non-virtual interface with data transfer', () => {
    // Simulated list of network interfaces returned by systeminformation
    const stats = [
      // Interface that is down should be ignored
      { iface: 'eth0', operstate: 'down', virtual: false, rx_bytes: 0, tx_bytes: 0 },
      // Loopback is up but virtual, so should also be ignored
      { iface: 'lo', operstate: 'up', virtual: true, rx_bytes: 100, tx_bytes: 100 },
      // This interface is up, not virtual and has traffic -> should be selected
      { iface: 'wifi0', operstate: 'up', virtual: false, rx_bytes: 50, tx_bytes: 60 },
      // Up and non-virtual but no traffic yet
      { iface: 'wifi1', operstate: 'up', virtual: false, rx_bytes: 0, tx_bytes: 0 }
    ];

    // Execute the helper and verify the expected interface is chosen
    const result = selectPrimaryInterface(stats);
    expect(result.iface).toBe('wifi0');
  });

  test('defaults to first interface if none match', () => {
    // No interface meets the "active non-virtual with traffic" criteria
    const stats = [
      { iface: 'eth0', operstate: 'down', virtual: false, rx_bytes: 0, tx_bytes: 0 },
      { iface: 'wifi1', operstate: 'up', virtual: false, rx_bytes: 0, tx_bytes: 0 }
    ];

    // In this scenario the function should return the first interface
    const result = selectPrimaryInterface(stats);
    expect(result.iface).toBe('eth0');
  });
});
