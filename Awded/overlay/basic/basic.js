const electron = require("electron");
const { ipcMain, app, Tray, Menu, BrowserWindow, nativeImage } = electron;
const FFT = require("../../FFT/FFT.js");

ipcRenderer.on("options", (e, v) => {
  setOptions(v);
});

const setOptions = options => {
  document
    .querySelector(".bars")
    .style.setProperty("--fftSize", options["FFT Size"]);
  body.style.setProperty("--theme", options["Theme"]);
  body.style.setProperty("--update-fps", options["Update Fps"]);
  body.style.setProperty("--primary-color", options["Primary Color"]);
  body.style.setProperty("--secondary-color", options["Secondary Color"]);
  body.style.setProperty("--tertiary-color", options["Tertiary Color"]);
  body.style.setProperty("--bar-rotation", options["Bar Rotation"]);
  body.style.setProperty("--bar-width", options["Bar Width"]);
  body.style.setProperty("--bar-height", options["Bar Height"]);
  body.style.setProperty("--average-length", options["Average Length"]);
  body.style.setProperty("--bar-y-spread", options["Bar Y Spread"]);
  body.style.setProperty("--bar-x-spread", options["Bar X Spread"]);
  body.style.setProperty("--bar-offset-x", options["Bar Offset X"]);
  body.style.setProperty("--bar-offset-y", options["Bar Offset Y"]);
  body.style.setProperty("--bar-inverse", options["Bar Inverse"] ? 1 : -1);

  let oldStyle = document.querySelector("#themeStyle");
  if (options["Theme"] !== "Default") {
    let themeStyles = document.createElement("link");
    themeStyles.rel = "stylesheet";
    themeStyles.type = "text/css";
    themeStyles.href = "../themes/" + options["Theme"] + "/styles.css";
    themeStyles.id = "themeStyle";

    let themeScript = document.createElement("script");
    if (oldStyle) {
      oldStyle.remove();
    }

    themeScript.id = "themeScript";
    themeScript.src = "../themes/" + options["Theme"] + "/main.js";
    //not adding script untill I can look into security of it
    head.appendChild(themeStyles);
  } else {
    if (oldStyle) {
      oldStyle.remove();
    }
  }
};
