const debug = process.argv[2] == "debug";
const { ipcMain, app } = require("electron");
const Awded = require("./Awded/Awded.js");
const awded = new Awded();

[app, ipcMain].forEach(eventEmitter => {
  eventEmitter.on("initialize", (e, v) => awded.initialize(v));
  eventEmitter.on("createOptionsWindow", (e, v) =>
    awded.createOptionsWindow(v)
  );
  eventEmitter.on("createOverlayWindow", (e, v) =>
    awded.createOverlayWindow(v)
  );
  eventEmitter.on("setOptions", (e, v) => {
    awded.setOptions(v);
  });
  eventEmitter.on("quit", (e, v) => awded.quit(v));
});

app.on("ready", () => {
  awded.debug = debug;
  awded.initialize();
  awded.setOptions(require("./json/options.json"));
});
