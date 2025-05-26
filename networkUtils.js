// Utility functions related to network interfaces
// This module exports selectPrimaryInterface so it can be tested

/**
 * Choose the primary network interface from a list of stats.
 * The preferred interface is:
 *   - operstate === 'up'
 *   - not virtual
 *   - has transmitted or received data
 * If none match, the first interface is returned.
 * @param {Array<Object>} stats array of network stats from systeminformation
 * @returns {Object} the chosen interface
 */
function selectPrimaryInterface(stats) {
  return (
    stats.find(
      (iface) =>
        iface.operstate === 'up' &&
        !iface.virtual &&
        (iface.rx_bytes > 0 || iface.tx_bytes > 0)
    ) || stats[0]
  );
}

module.exports = {
  selectPrimaryInterface,
};
