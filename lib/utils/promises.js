"use strict";
const nfs = require("fs");
function lstatPromise(filePath) {
    return new Promise((resolve, reject) => {
        nfs.lstat(filePath, function (err, stat) {
            if (err)
                return reject(err);
            else
                return resolve(stat);
        });
    });
}
function readdirPromise(folder) {
    return new Promise((resolve, reject) => {
        nfs.readdir(folder, function (err, files) {
            if (err)
                return reject(err);
            else
                return resolve(files);
        });
    });
}
exports.fs = {
    lstat: lstatPromise,
    readdir: readdirPromise
};
