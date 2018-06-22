const { BrowserWindow } = require("electron");

module.exports = BrowserWindow({
  title: "Awded",
  fullscreen: true,
  alwaysOnTop: true,
  transparent: true,
  titleBarStyle: "hidden",
  frame: false,
  thickFrame: false,
  icon: icon
});
