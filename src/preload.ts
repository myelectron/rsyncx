import { contextBridge, ipcRenderer } from 'electron';
import { SpawnOptionsWithoutStdio } from 'child_process';

// 定义回调函数类型
type RsyncCallback = (data: string) => void;
let outputCallback: RsyncCallback | null = null;
let errorCallback: RsyncCallback | null = null;

ipcRenderer.on('rsync-output', (event, data) => {
    console.log('rsync-output', data);
    outputCallback && outputCallback(data);
});
ipcRenderer.on('rsync-error', (event, data) => {
    console.log('rsync-error', data);
    errorCallback && errorCallback(data);
});

contextBridge.exposeInMainWorld('api', {
    execRsync: (params: string[], options: SpawnOptionsWithoutStdio) => {
        console.log('params', params, 'options', options);
        ipcRenderer.send('spawn-rsync', params, options);
    },
    onRsyncOutput: (callback: RsyncCallback) => {
        outputCallback = callback;
    },
    onRsyncError: (callback: RsyncCallback) => {
        errorCallback = callback;
    },
});
