const { app, remote } = require("electron");
const appPath = (app || remote.app).getAppPath();

paths = {
  icon: "/icon.ico",
  tray: "/Awded/tray/tray.js",
  options: "/json/options.json",
  mainWindowHtml: "/Awded/mainWindow/mainWindow.html",
  mainWindowJs: "/Awded/mainWindow/mainWindow.js",
  defaultOptions: "/json/defaultOptions.json",
  inputTypes: "/json/inputTypes.json",
  optionsSetup: "/json/optionsSetup.json",
  optionsWindowHtml: "/Awded/optionsWindow/optionsWindow.html",
  optionsWindowJs: "/Awded/optionsWindow/optionsWindow.js",
  themes: "/themes/",
  FFT: "/Awded/FFT/FFT.js",
  AwdedFFT: "/AwdedFFT.exe"
};

//add appPath
for (path in paths) {
  paths[path] = appPath + paths[path].replace(/\//g, "\\");
}

paths.AwdedFFT = paths.AwdedFFT.replace("app.asar", "app.asar.unpacked");

module.exports = paths;
