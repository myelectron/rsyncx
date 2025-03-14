/** 工作 */
export interface JobMo {
    /** 工作id */
    id: string;
    /** 工作名称 */
    name: string;
    /** 来源 */
    src: string;
    /** 目标 */
    target: string;
    /** 端口 */
    port?: number;
    /** 是否删除冗余文件 */
    deleteRedundancy?: boolean;
    /** 忽略文件 */
    exclude?: string;
    /** 执行参数 */
    args?: string;
    /** 顺序 */
    seq?: number;
    /** 是否反向同步 */
    isReversed?: boolean;
}
