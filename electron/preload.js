const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  platform: process.platform,
  notify: (title, body) => {
    new Notification(title, { body })
  },
})
