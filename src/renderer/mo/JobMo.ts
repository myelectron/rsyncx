/** 工作 */
export interface JobMo {
    id: string;
    name: string;
    src: string;
    target: string;
    port?: number;
    deleteRedundancy?: boolean;
    exclude?: string;
    args?: string;
    seq?: number;
}
