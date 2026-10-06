const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('appInfo', {
  name: 'Metal Producer',
  version: '0.1.0',
  platform: process.platform,
});
