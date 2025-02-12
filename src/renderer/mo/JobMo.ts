// /** 工作 */
// interface JobMo {
//     id: string;
//     name: string;
//     src: string;
//     target: string;
//     port?: number;
//     delete?: boolean;
//     exclude?: string;
//     args?: string;
//     seq?: number;
// }

const JobMo = {
    id: '',
    name: '',
    src: '',
    target: '',
    port: 0,
    delete: false,
    exclude: '',
    args: '',
    seq: 0,
} as const;

export { JobMo };
