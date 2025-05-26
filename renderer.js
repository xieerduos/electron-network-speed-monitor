/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */
window.electronAPI.onNetworkSpeed((event, data) => {
  document.getElementById("interface-name").textContent = data.iface;
  document.getElementById("upload").textContent = data.uploadSpeed;
  document.getElementById("download").textContent = data.downloadSpeed;
  document.getElementById("error-message").textContent = "";
});
window.electronAPI.onNetworkError((error) => {
  document.getElementById("error-message").textContent = `错误: ${error}`;
});
