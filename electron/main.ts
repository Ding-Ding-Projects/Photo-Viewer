import { app, BrowserWindow } from "electron";
import path from "path";

const isDev = process.env.NODE_ENV === "development";

let win: BrowserWindow | null = null;

function createWindow(): void {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 480,
    minHeight: 320,
    title: "Photo Viewer",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // In development, load the Vite dev server URL
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // In production, load the built index.html
    const distPath = path.join(__dirname, "..", "dist", "index.html");
    win.loadFile(distPath);
  }

  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
