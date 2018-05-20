const electron = require("electron");
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
const Tray = electron.Tray;
const Menu = electron.Menu;

const BrowserWindow = electron.BrowserWindow;
const nativeImage = electron.nativeImage;

const path = require("path");
const url = require("url");
const fs = require("fs");

let mainWindow;
let optionsWindow;
let tray;

const icon = nativeImage.createFromPath(path.join(__dirname, "icon.png"));
const defaultOptionsPath = path.join(__dirname, "/json/defaultOptions.json");
const optionsPath = path.join(__dirname, "/json/options.json");
const themesPath = path.join(__dirname, "/themes/");
const debug = process.argv[2] == "debug";

function openOptions() {
  if (optionsWindow) {
    optionsWindow.close();
  }

  optionsWindow = new BrowserWindow({
    icon: icon,
    title: "Awded - Options",
    resizable: false,
    width: 320,
    height: 450
  });

  optionsWindow.on("close", x => {
    mainWindow.send("options", require(optionsPath));
  });

  optionsWindow.setMenu(null);

  optionsWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/options.html"),
      protocol: "file:",
      slashes: true
    })
  );

  ipcMain.on("options", (e, v) => {
    mainWindow.send("options", v);
  });

  optionsWindow.on("closed", function() {
    optionsWindow = null;
  });

  if (debug) {
    optionsWindow.openDevTools({ detach: true });
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Awded",
    fullscreen: true,
    alwaysOnTop: true,
    transparent: true,
    titleBarStyle: "hidden",
    frame: false,
    thickFrame: false,
    icon: icon
  });

  mainWindow.setIgnoreMouseEvents(true, { forward: false });
  mainWindow.setFocusable(false);

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/index.html"),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.on("closed", quit);

  if (debug) {
    mainWindow.openDevTools({ detach: true });
  }
}

if (!fs.existsSync(optionsPath)) {
  fs
    .createReadStream(defaultOptionsPath)
    .pipe(fs.createWriteStream(optionsPath));
}

function quit() {
  mainWindow = null;
  optionsWindow = null;
  app.quit();
}

function reinitialize() {
  if (mainWindow) {
    mainWindow.reload();
  } else {
    mainWindow = null;
    createWindow();
  }
}

app.on("ready", function() {
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Reinitialize",
      type: "normal",
      click() {
        return reinitialize();
      }
    },
    {
      label: "Options",
      type: "normal",
      click() {
        return openOptions();
      }
    },
    { label: "", type: "separator" },
    {
      label: "Quit",
      type: "normal",
      click() {
        return quit();
      }
    }
  ]);
  tray.setToolTip("Awded");
  tray.setContextMenu(contextMenu);
  createWindow();
});

app.on("window-all-closed", quit);

app.on("activate", function() {
  if (mainWindow === null) {
    createWindow();
  }
});
