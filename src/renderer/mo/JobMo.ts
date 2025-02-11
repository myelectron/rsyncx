/** 工作 */
interface JobMo {
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

export type { JobMo };
