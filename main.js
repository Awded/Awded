const electron = require('electron');
// Module to control application life.
const app = electron.app;
const Tray = electron.Tray;
const Menu = electron.Menu;

const BrowserWindow = electron.BrowserWindow;
const nativeImage = electron.nativeImage;

const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;
let optionsWindow;
let tray;

const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));
const defaultOptionsPath = path.join(__dirname, '/json/defaultOptions.json')
const optionsPath = path.join(__dirname, '/json/options.json');
const themesPath = path.join(__dirname, '/themes/');
//require('electron-reload')(__dirname);

function openOptions() {
  if(optionsWindow){
    optionsWindow.close();
  }
  optionsWindow = new BrowserWindow({
    icon: icon,
    title: "Awded - Options",
    resizable: false,
    width: 300,
    height: 400
  });

  optionsWindow.setMenu(null);

  optionsWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'options.html'),
    protocol: 'file:',
    slashes: true
  }));

  optionsWindow.on('closed', function() {
    optionsWindow = null;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: "Awded",
    fullscreen: true,
    alwaysOnTop: true,
    transparent: true,
    titleBarStyle: 'hidden',
    frame: false,
    thickFrame: false,
    icon: icon
  });

  mainWindow.openDevTools({detach: true})

  mainWindow.setIgnoreMouseEvents(true, {forward: false});
  mainWindow.setFocusable(false);

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function() {
    mainWindow = null;
    app.quit();
  });

}

if(!fs.existsSync(optionsPath)){
  fs.createReadStream(defaultOptionsPath).pipe(fs.createWriteStream(optionsPath));
}

fs.watch(optionsPath, reinitialize);
fs.watch(themesPath, reinitialize);


function reinitialize(){
  if(mainWindow){
    mainWindow.reload();
  } else {
    mainWindow = null;
    createWindow();
  }
}

app.on('ready', function(){
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {label: "Reinitialize", type: 'normal', click(){return reinitialize();}},
    {label: 'Options', type: 'normal', click(){ return openOptions();}},
    {label: '', type: 'separator'},
    {label: 'Quit', type: 'normal', click(){ return app.quit();}}
  ]);
  tray.setToolTip('Awded');
  tray.setContextMenu(contextMenu);
  createWindow();
});

app.on('window-all-closed', function() {
  app.quit();
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
