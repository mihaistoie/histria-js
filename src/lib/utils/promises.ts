import * as nfs from 'fs';

function lstatPromise(filePath: string): Promise<nfs.Stats> {
    return new Promise<nfs.Stats>((resolve, reject) => {
        nfs.lstat(filePath, function (err, stat) {
            if (err)
                return reject(err);
            else
                return resolve(stat);
        });

    });
}

function readdirPromise(folder: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        nfs.readdir(folder, function (err, files) {
            if (err)
                return reject(err);
            else
                return resolve(files);
        });

    });
}


export var fs = {
    lstat: lstatPromise,
    readdir: readdirPromise
}

