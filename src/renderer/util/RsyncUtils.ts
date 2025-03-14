import { SpawnOptionsWithoutStdio } from 'child_process';
import { JobMo } from '../mo/JobMo';

// 执行 rsync 命令
export const execRsync = (job: JobMo) => {
    let { src, target } = job;
    const { port, deleteRedundancy, exclude, args } = job;
    const options: SpawnOptionsWithoutStdio = {};
    const params: string[] = ['-avzP'];
    port && params.push(`-e 'ssh -p ${port}'`);
    deleteRedundancy && params.push('--delete');
    exclude && params.push(...`--exclude=${exclude.split(/[\s,]+/).join(' --exclude=')}`.split(/[\s]+/));
    args && params.push(args);
    if (src.startsWith('~/') || target.startsWith('~/')) {
        src = src.replace(/^~\//, '');
        target = target.replace(/^~\//, '');
        options.cwd = 'home';
    }
    params.push(src, target);
    return window.api.execRsync(params, options);
};

export const onRsyncOutput = (callback: (data: string) => void) => {
    window.api.onRsyncOutput(callback);
};

export const onRsyncError = (callback: (data: string) => void) => {
    window.api.onRsyncError(callback);
};
