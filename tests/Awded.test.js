const electron = require("electron");
const { ipcMain, app, Tray, Menu } = electron;
const Awded = require("../Awded/Awded");

test("awded is instance of Awded ", () => {
  return Awded.awded instanceof Awded;
});

test("instance of Awded(true) enables debug widnow ", () => {});

//TODO, set a optional flag in methods for testing? to assert the window has changes

test("Awded.reinitialize reloads window", () => {
  //awded.reinitialize();
});

test("Awded.createWindow opens a new window", () => {
  //awded.
});

test("Awded.setOptions updates options", () => {});

test("Awded.quit closes app", () => {});
