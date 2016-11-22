export declare class Transaction {
    private _id;
    constructor();
    create<T>(classOfInstance: any): T;
    restore<T>(classOfInstance: any, data: any): T;
    load<T>(classOfInstance: any, data: any): T;
}
