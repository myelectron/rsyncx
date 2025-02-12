import { db } from '../Db';
import { JobMo } from '../mo/JobMo';

export const JobApi = {
    list: async () => {
        return await db.job.toArray();
    },
    add: async (job: JobMo) => {
        return await db.job.add(job);
    },
    update: async (job: JobMo) => {
        console.log(job);

        return await db.job.update(job.id, job);
    },
    del: async (id: number) => {
        return await db.job.delete(id);
    },
};
