import { Dexie, EntityTable } from 'dexie';
import { JobMo } from './mo/JobMo';

// 创建一个新的 Dexie 实例
const db = new Dexie('rsyncx') as Dexie & {
    job: EntityTable<JobMo, 'id'>;
};

// 定义数据库模式
const schema = '++id,&name,seq';
db.version(1).stores({
    job: schema,
});

export { db };
