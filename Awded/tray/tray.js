const electron = require("electron");
const { ipcMain, app, Tray, Menu } = electron;
let tray;

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
});

module.exports = tray;
