/// <reference types="node" />
import * as nfs from 'fs';
export declare var fs: {
    lstat: (filePath: string) => Promise<nfs.Stats>;
    readdir: (folder: string) => Promise<string[]>;
    readFile: (fileName: string) => Promise<Buffer>;
    writeFile: (fileName: string, data: any) => Promise<void>;
};
