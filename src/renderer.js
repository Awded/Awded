const electron = require("electron");
const app = electron.remote.app;
const ipcRenderer = electron.ipcRenderer;
const cp = require("child_process");
const path = require("path");
const fs = require("fs");

const defaultOptionsPath = path.join(__dirname, "../json/defaultOptions.json");
const optionsPath = path.join(__dirname, "../json/options.json");
const themesPath = path.join(__dirname, "../themes/");

if (!fs.existsSync(optionsPath)) {
  fs
    .createReadStream(defaultOptionsPath)
    .pipe(fs.createWriteStream(optionsPath));
}

let awdedFFT;

let options = require(optionsPath);

let bars = {
  left: document.querySelector("#leftbars"),
  right: document.querySelector("#rightbars")
};

const Fft = require("./Fft.js")(bars.left, bars.right, options);

initialize(options);

ipcRenderer.on("options", (e, v) => {
  setOptions(v);
});

function setOptions(newOptions) {
  let selectedThemePath = path.join(themesPath, newOptions["Theme"]);
  let body = document.querySelector("body");
  let head = document.querySelector("head");

  Fft.setOptions(newOptions);

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
    newOptions["Theme"] != options["Theme"]
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
    //not appending scripts at this time until I can figure out the (in)security

    head.appendChild(themeStyles);
  } else if (newOptions["Theme"] == "Default") {
    let oldStyle = document.querySelector("#themeStyle");
    if (oldStyle) {
      oldStyle.remove();
    }
  }
  options = newOptions;
}

function initialize(options) {
  setOptions(options);
}
