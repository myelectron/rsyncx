import { Dexie } from 'dexie';
import { JobMo, jobMoKeys } from './mo/JobMo';

// 创建一个新的 Dexie 实例
const db = new Dexie('rsyncx') as Dexie & {
    job: Dexie.Table<JobMo, 'id'>;
};

// 定义数据库模式
const schema = `++${jobMoKeys.join(',')}`;
db.version(1).stores({
    job: schema,
});

export { db };
