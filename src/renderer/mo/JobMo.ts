/** 工作 */
export interface JobMo {
    id: number;
    name: string;
    src: string;
    target: string;
    port?: number;
    delete?: boolean;
    exclude?: string;
    args?: string;
    seq?: number;
}
