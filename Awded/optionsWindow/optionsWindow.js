const { nativeImage } = require("electron");
const paths = require("../paths.js");
const icon = nativeImage.createFromPath(paths.icon);

module.exports = {
  icon: icon,
  title: "Awded - Options",
  resizable: false,
  titleBarStyle: "hidden",
  width: 320,
  height: 450
};
