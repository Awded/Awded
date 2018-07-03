const { BrowserWindow, nativeImage } = require("electron");
const paths = require("../paths.js");
const icon = nativeImage.createFromPath(paths.icon);

module.exports = {
  title: "Awded",
  fullscreen: true,
  alwaysOnTop: true,
  transparent: true,
  titleBarStyle: "hidden",
  frame: false,
  thickFrame: false,
  icon: icon
};
