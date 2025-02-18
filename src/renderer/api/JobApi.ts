import { db } from '../Db';
import { JobMo } from '../mo/JobMo';

export const JobApi = {
    list: async () => {
        return await db.job.orderBy('seq').toArray();
    },
    add: async (job: JobMo) => {
        console.log('add', job);
        return await db.job.add({ ...job });
    },
    update: async (job: JobMo) => {
        console.log('update', job);
        return await db.job.put({ ...job });
    },
    del: async (id: string) => {
        console.log('delete', id);
        return await db.job.delete(id);
    },
};
