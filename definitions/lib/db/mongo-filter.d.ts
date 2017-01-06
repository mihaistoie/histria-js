export declare function findInArray(query: any, array: any[], options?: {
    findFirst?: boolean;
    transform?: (item: any) => any;
}): any;
export declare function findInMap(query: any, map: Map<any, any>, options?: {
    findFirst?: boolean;
    transform?: (item: any) => any;
}): any;
export declare function mongoFilter(query: any, array: any[]): any;
