const electron = require("electron");
const { ipcMain, app, Tray, Menu } = electron;

class Awded {
  constructor(debug = false) {
    this.mainWindow;
    this.optionsWindow;
    this.debug = debug;
  }

  reinitialize() {
    if (this.mainWindow) {
      this.mainWindow.reload();
    } else {
      this.mainWindow = null;
      this.createWindow();
    }
  }

  createWindow() {
    this.mainWindow = new BrowserWindow({
      title: "Awded",
      fullscreen: true,
      alwaysOnTop: true,
      transparent: true,
      titleBarStyle: "hidden",
      frame: false,
      thickFrame: false,
      icon: icon
    });

    this.mainWindow.setIgnoreMouseEvents(true, { forward: false });
    this.mainWindow.setFocusable(false);

    this.mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "src/index.html"),
        protocol: "file:",
        slashes: true
      })
    );

    this.mainWindow.on("closed", this.quit);

    if (this.debug) {
      this.mainWindow.openDevTools({ detach: true });
    }
  }

  setOptions(newOptions) {
    let selectedThemePath = path.join(themesPath, newOptions["Theme"]);
    let body = document.querySelector("body");
    let head = document.querySelector("head");

    Fft.setOptions(newOptions);

    if (
      !awdedFFT ||
      newOptions["Update Fps"] != this.options["Update Fps"] ||
      newOptions["FFT Size"] != this.options["FFT Size"]
    ) {
      if (awdedFFT) {
        console.log("killing awded");
        awdedFFT.kill("SIGINT");
      }

      awdedFFT = cp.spawn(
        path
          .join(app.getAppPath(), "AwdedFFT.exe")
          .replace("app.asar", "app.asar.unpacked"),
        [
          Math.round(1000 / newOptions["Update Fps"]),
          parseInt(newOptions["FFT Size"], "10").toString(),
          "12"
        ]
      );

      awdedFFT.stdout.on("data", data => {
        try {
          Fft.setList(JSON.parse(data));
        } catch (e) {
          console.log(e);
        }
      });
    }

    document
      .querySelector(".bars")
      .style.setProperty("--fftSize", newOptions["FFT Size"]);
    body.style.setProperty("--theme", newOptions["Theme"]);
    body.style.setProperty("--update-fps", newOptions["Update Fps"]);
    body.style.setProperty("--primary-color", newOptions["Primary Color"]);
    body.style.setProperty("--secondary-color", newOptions["Secondary Color"]);
    body.style.setProperty("--tertiary-color", newOptions["Tertiary Color"]);
    body.style.setProperty("--bar-rotation", newOptions["Bar Rotation"]);
    body.style.setProperty("--bar-width", newOptions["Bar Width"]);
    body.style.setProperty("--bar-height", newOptions["Bar Height"]);
    body.style.setProperty("--average-length", newOptions["Average Length"]);
    body.style.setProperty("--bar-y-spread", newOptions["Bar Y Spread"]);
    body.style.setProperty("--bar-x-spread", newOptions["Bar X Spread"]);
    body.style.setProperty("--bar-offset-x", newOptions["Bar Offset X"]);
    body.style.setProperty("--bar-offset-y", newOptions["Bar Offset Y"]);
    body.style.setProperty("--bar-inverse", newOptions["Bar Inverse"] ? 1 : -1);

    if (
      newOptions["Theme"] !== "Default" &&
      newOptions["Theme"] != this.options["Theme"]
    ) {
      let themeStyles = document.createElement("link");
      themeStyles.rel = "stylesheet";
      themeStyles.type = "text/css";
      themeStyles.href = "../themes/" + newOptions["Theme"] + "/styles.css";
      themeStyles.id = "themeStyle";

      let themeScript = document.createElement("script");
      let oldStyle = document.querySelector("#themeStyle");
      if (oldStyle) {
        oldStyle.remove();
      }

      themeScript.id = "themeScript";
      themeScript.src = "../themes/" + newOptions["Theme"] + "/main.js";
      head.appendChild(themeStyles);
    } else if (newOptions["Theme"] == "Default") {
      let oldStyle = document.querySelector("#themeStyle");
      if (oldStyle) {
        oldStyle.remove();
      }
    }
    this.options = newOptions;
  }

  quit() {
    app.quit();
  }
}

const awded = new Awded();

module.exports = {
  Awded,
  awded
};
