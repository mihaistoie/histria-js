export declare function typeOfProperty(propSchema: {
    type?: string;
    format?: string;
    reference?: string;
}): string;
export declare function isHidden(propSchema: any): boolean;
export declare function isReadOnly(propSchema: any): boolean;
export declare function isComplex(schema: any): boolean;
export declare function expandSchema(schema: any, model: any): void;
export declare function loadModel(pathToModel: string, model: any): Promise<void>;
