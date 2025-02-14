import { SpawnOptionsWithoutStdio } from 'child_process';

export interface ElectronApi {
    execRsync: (params: string[], options: SpawnOptionsWithoutStdio) => void;
    onRsyncOutput: (callback: (data: string) => void) => void;
    onRsyncError: (callback: (data: string) => void) => void;
}

declare global {
    interface Window {
        api: ElectronApi;
    }
}
