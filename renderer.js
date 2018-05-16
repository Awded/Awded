const electron = require("electron");
const app = electron.remote.app;
const ipcRenderer = electron.ipcRenderer;
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

const defaultOptionsPath = path.join(__dirname, "/json/defaultOptions.json");
const optionsPath = path.join(__dirname, "/json/options.json");
const themesPath = path.join(__dirname, "/themes/");

if (!fs.existsSync(optionsPath)) {
  fs
    .createReadStream(defaultOptionsPath)
    .pipe(fs.createWriteStream(optionsPath));
}

let awdedFFT;

let options = require(optionsPath);
let quarterFftSize = options["FFT Size"] / 4;

let bars = {
  left: document.querySelector("#leftbars"),
  right: document.querySelector("#rightbars")
};

let ffts = {
  _list: [],
  get list() {
    return this._list;
  },
  set list(newFfts) {
    if (Array.isArray(newFfts)) {
      if (this._list.length == newFfts.length) {
        newFfts.forEach((v, i) => {
          this._list[i].value = Math.log10(v) * 100;
        });
      } else {
        this._list = [];
        while (bars.left.firstChild) {
          bars.left.removeChild(bars.left.firstChild);
        }
        while (bars.right.firstChild) {
          bars.right.removeChild(bars.right.firstChild);
        }
        this._list = newFfts.map((v, i) => {
          return new Fft(v, i, i < quarterFftSize ? bars.left : bars.right);
        });
      }
    } else {
      throw new TypeError("Fft list must be an array.");
    }
  }
};

initialize(options);

ipcRenderer.on("options", (e, v) => {
  setOptions(v);
});

function setOptions(newOptions) {
  let selectedThemePath = path.join(themesPath, newOptions["Theme"]);
  let body = document.querySelector("body");
  let head = document.querySelector("head");
  //if fft or fps different, restart awdedFft!
  if (
    !awdedFFT ||
    newOptions["Update Fps"] != options["Update Fps"] ||
    newOptions["FFT Size"] != options["FFT Size"]
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
        ffts.list = JSON.parse(data);
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
    newOptions["Theme"] != options["Theme"]
  ) {
    let themeStyles = document.createElement("link");
    themeStyles.rel = "stylesheet";
    themeStyles.type = "text/css";
    themeStyles.href = "./themes/" + newOptions["Theme"] + "/styles.css";

    let themeScript = document.createElement("script");
    let oldStyle = document.querySelector("#themeStyle");
    if (oldStyle) {
      oldStyle.remove();
    }
    themeScript.id = "themeStyle";
    themeScript.src = "./themes/" + newOptions["Theme"] + "/main.js";
    head.appendChild(themeStyles);
  }
  options = newOptions;
}

class Fft {
  constructor(value, i, parent) {
    this._pastValues = [0, 0, 0, 0, 0];
    this._value = value;
    this._index = i;
    this._peak = 0;
    this._parent = parent;
    this._otherChannel = false;
    this.el = document.createElement("li");
    this.el.style.setProperty("--position", this._index % quarterFftSize);
    parent.appendChild(this.el);
    return this;
  }

  get value() {
    return this._value;
  }

  set value(x) {
    this._value = x;
    this._pastValues.push(x);
    while (this._pastValues.length > options["Average Length"])
      this._pastValues.shift();
    this.peak = x;
    if (!this._otherChannel) {
      if (this._parent == bars.right) {
        this._otherChannel = ffts.list[this._index - quarterFftSize];
      } else {
        this._otherChannel = ffts.list[this._index + quarterFftSize];
      }
    }
    this.el.style.setProperty("--value", this._value);
    this.el.style.setProperty("--average-value", this.averageValue);
    this.el.style.setProperty("--peak-value", this.peak);
    if (this._otherChannel) {
      this.el.style.setProperty("--other-value", this._otherChannel._value);
      this.el.style.setProperty(
        "--other-average-value",
        this._otherChannel.averageValue
      );
      this.el.style.setProperty("--other-peak-value", this._otherChannel._peak);
    }
    return this._value;
  }

  get peak() {
    return this._peak;
  }

  set peak(x) {
    this._peak -= options["Peak Decay"];
    this._peak = Math.max(0, Math.max(this._peak, x));
    return this._peak;
  }

  get averageValue() {
    return Math.max(
      this._pastValues.reduce((t, v) => t + v) / this._pastValues.length,
      0.0001
    );
  }
}

function initialize(options) {
  setOptions(options);
}
