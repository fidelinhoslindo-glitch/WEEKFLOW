const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  openExternal: (url) => ipcRenderer.send('open-external', url),
  notify: (title, body) => {
    new Notification(title, { body })
  },
})
