// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const si = require("systeminformation");
const path = require("node:path");
const bytes = require("bytes");

let mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
// 存储上一次获取到的网络接口数据，用于计算速度的差值
let lastNetworkStats = null;

// 选择当前主用的网络接口（已启用、非虚拟接口且存在数据传输）
function selectPrimaryInterface(stats) {
  return (
    stats.find(
      (iface) =>
        iface.operstate === "up" && // 接口状态为启用（up）
        !iface.virtual && // 非虚拟网络接口
        (iface.rx_bytes > 0 || iface.tx_bytes > 0) // 存在数据传输
    ) || stats[0] // 若未找到符合条件的接口，则默认使用第一个接口
  );
}

// 周期性地获取网络接口数据并计算当前网速
async function getNetworkSpeed() {
  try {
    // 获取系统中所有网络接口的统计信息
    const networkStatsArray = await si.networkStats();

    // 从接口列表中选择主网络接口
    const primaryIface = selectPrimaryInterface(networkStatsArray);

    // 确保上一次记录存在且接口未发生变化
    if (lastNetworkStats && primaryIface.iface === lastNetworkStats.iface) {
      // 计算上传与下载的速度（以字节每秒为单位）
      const uploadSpeed = primaryIface.tx_bytes - lastNetworkStats.tx_bytes;
      const downloadSpeed = primaryIface.rx_bytes - lastNetworkStats.rx_bytes;

      // 如果窗口存在并未被销毁，则向渲染进程发送速度数据
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("network-speed", {
          iface: primaryIface.iface, // 网络接口名称，如 Wi-Fi、eth0 等

          // 默认显示方式：自动转换合适单位（如 KB/s, MB/s）
          uploadSpeed: `${bytes(uploadSpeed)}/s`,
          downloadSpeed: `${bytes(downloadSpeed)}/s`,

          // 备用实现方式，以 Mbps 为单位显示网速（默认注释）
          // uploadSpeed: `${((uploadSpeed * 8) / 1e6).toFixed(2)} Mbps`,
          // downloadSpeed: `${((downloadSpeed * 8) / 1e6).toFixed(2)} Mbps`,

          // 备用实现方式，以 Kbps 为单位显示网速（默认注释）
          // uploadSpeed: `${((uploadSpeed * 8) / 1e3).toFixed(2)} Kbps`,
          // downloadSpeed: `${((downloadSpeed * 8) / 1e3).toFixed(2)} Kbps`,
        });
      }
    }

    // 更新上一次的接口数据，以便下次计算速度差值
    lastNetworkStats = primaryIface;
  } catch (error) {
    // 错误处理：记录错误信息并发送给渲染进程进行提示
    console.error("Error fetching network stats:", error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("network-speed-error", error.message);
    }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // 每秒钟更新一次
  setInterval(getNetworkSpeed, 1000);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
