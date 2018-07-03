const electron = require("electron");
const { app, BrowserWindow } = electron;

const cp = require("child_process");
const url = require("url");
const path = require("path");
const paths = require("./paths.js");
const tray = require(paths.tray);

class Awded {
  constructor(debug = false) {
    this.mainWindow;
    this.optionsWindow;
    this.awdedFFT;
    this.debug = debug;
  }

  initialize() {
    if (this.mainWindow) {
      this.mainWindow.reload();
    } else {
      this.mainWindow = null;
      this.createOverlayWindow();
    }

    if (this.optionsWindow) {
      this.createOptionsWindow();
    }
  }

  createOverlayWindow() {
    this.mainWindow = new BrowserWindow(require(paths.mainWindowJs));

    this.mainWindow.setIgnoreMouseEvents(true, { forward: false });
    this.mainWindow.setFocusable(false);

    this.mainWindow.loadURL(
      url.format({
        pathname: paths.mainWindowHtml,
        protocol: "file:",
        slashes: true
      })
    );

    if (this.debug) this.mainWindow.openDevTools({ detach: true });

    this.mainWindow.on("closed", () => this.quit());
  }

  createOptionsWindow() {
    if (this.optionsWindow) this.optionsWindow.close();
    this.optionsWindow = new BrowserWindow(require(paths.optionsWindowJs));

    this.optionsWindow.loadURL(
      url.format({
        pathname: paths.optionsWindowHtml,
        protocol: "file:",
        slashes: true
      })
    );
    if (this.debug) this.optionsWindow.openDevTools({ detach: true });
    this.optionsWindow.on("closed", () => (this.optionsWindow = undefined));
  }

  setOptions(newOptions) {
    if (
      this.mainWindow &&
      !this.mainWindow.closed &&
      this.mainWindow.webContents
    )
      this.mainWindow.webContents.send("setOptions", newOptions);
    let selectedThemePath = path.join(paths.themes, newOptions["Theme"]);

    if (
      !this.awdedFFT ||
      newOptions["Update Fps"] != this.options["Update Fps"] ||
      newOptions["FFT Size"] != this.options["FFT Size"]
    ) {
      if (this.awdedFFT) {
        this.awdedFFT.kill("SIGINT");
      }

      this.awdedFFT = cp.spawn(paths.AwdedFFT, [
        Math.round(1000 / newOptions["Update Fps"]),
        parseInt(newOptions["FFT Size"], "10").toString(),
        "12"
      ]);

      this.awdedFFT.stdout.on("data", data => {
        try {
          this.mainWindow.webContents.send("FFTData", JSON.parse(data));
        } catch (e) {
          if (this.debug) console.log(e);
        }
      });
    }

    this.options = newOptions;
  }

  quit() {
    if (this.optionsWindow && !this.optionsWindow.closed)
      this.optionsWindow.destroy();
    app.quit();
  }
}

module.exports = Awded;
