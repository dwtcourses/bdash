import electron from "electron";
import { updater } from "./updater";
import { initMenu } from "./menu";
import logger from "./logger";
import { windows, createWindow } from "./window";

const app = electron.app;
export let mainWindow: electron.BrowserWindow | null;

process.on("uncaughtException", err => {
  logger.error(err);
});

// https://github.com/electron/electron/issues/2984#issuecomment-145419711
process.once("loaded", () => {
  global.setImmediate = setImmediate;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", async () => {
  // https://github.com/electron/electron/issues/13008#issuecomment-569363295
  electron.session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const redirectURL = details.url.replace(
      /^devtools:\/\/devtools\/remote\/serve_file\/@[0-9a-f]{40}\//,
      "https://chrome-devtools-frontend.appspot.com/serve_file/@675968a8c657a3bd9c1c2c20c5d2935577bbc5e6/"
    );
    if (redirectURL !== details.url) {
      callback({ redirectURL });
    } else {
      callback({});
    }
  });
  createWindow();
  initMenu();
  await updater.watch();
});

app.on("activate", () => {
  if (windows.length === 0) {
    createWindow();
  }
});
