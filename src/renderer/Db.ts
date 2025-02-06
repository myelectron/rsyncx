import Dexie from 'dexie';
import { JobMo } from './mo/JobMo';

// 创建一个新的 Dexie 实例
const db = new Dexie('rsyncx') as Dexie & {
    jobMo: Dexie.Table<JobMo, 'id'>;
};

// 定义数据库模式
db.version(1).stores({
    jobMo: '++id,name,src,target,port,delete,exclude,args',
});

export { db };
