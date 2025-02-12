/** 工作 */
export interface JobMo {
    id: string;
    name: string;
    src: string;
    target: string;
    port?: number;
    delete?: boolean;
    exclude?: string;
    args?: string;
    seq?: number;
}

const jobMo: JobMo = {
    id: '',
    name: '',
    src: '',
    target: '',
    port: 0,
    delete: false,
    exclude: '',
    args: '',
    seq: 0,
};

export const jobMoKeys: string[] = Object.keys(jobMo);
