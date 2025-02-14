/** 工作 */
export interface JobMo {
    id: number;
    name: string;
    src: string;
    target: string;
    port?: number;
    deleteRedundancy?: boolean;
    exclude?: string;
    args?: string;
    seq?: number;
}
