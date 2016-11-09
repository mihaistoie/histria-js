/// <reference types="node" />
import * as nfs from 'fs';
export declare var fs: {
    lstat: (filePath: string) => Promise<nfs.Stats>;
    readdir: (folder: string) => Promise<string[]>;
};
