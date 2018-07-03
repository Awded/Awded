const { app, Tray, Menu, nativeImage } = require("electron");
const paths = require("../paths.js");
let tray;

const icon = nativeImage.createFromPath(paths.icon);

app.on("ready", function() {
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Reinitialize",
      type: "normal",
      click() {
        return app.emit("initialize", "tray");
      }
    },
    {
      label: "Options",
      type: "normal",
      click() {
        return app.emit("createOptionsWindow", "tray");
      }
    },
    { label: "", type: "separator" },
    {
      label: "Quit",
      type: "normal",
      click() {
        return app.emit("quit", "tray");
      }
    }
  ]);
  tray.setToolTip("Awded");
  tray.setContextMenu(contextMenu);
});

module.exports = tray;
