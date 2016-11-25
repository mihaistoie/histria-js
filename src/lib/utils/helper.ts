var
    _copyArray = function (src: any[], recursive: boolean): any[] {
        let res = new Array(src.length);
        src.forEach(function (item, index) {
            if (recursive && Array.isArray(item)) {
                res[index] = _copyArray(item, true);
            } else if (recursive && typeof item === 'object') {
                res[index] = _copyObject(null, item, true);
            } else
                res[index] = item;
        });
        return res;
    },
    _copyObject = function (dst: any, src: any, recursive: boolean): any {
        let res = dst || {};
        Object.keys(src).forEach(function (pn) {
            let item = src[pn];
            if (recursive && item && Array.isArray(item)) {
                res[pn] = _copyArray(item, true);
            } else if (recursive && item && typeof item === 'object') {
                res[pn] = _copyObject(null, item, true);
            } else
                res[pn] = item;
        });
        return res;
    },
    _extend = function (dst: any, src: any, recursive: boolean): any {
        if (!src) return dst;
        if (Array.isArray(src)) {
            return _copyArray(src, recursive);
        } else if (typeof src === 'object') {
            return _copyObject(dst, src, recursive);
        } else
            return dst;
    },

    _merge = function (src: any, dst: any): void {
        if (!src) return;
        for (let p in src) {
            let pv = src[p];
            let ov = dst[p];
            if (pv === null) continue;
            if (typeof pv === 'object' && !Array.isArray(pv)) {
                ov = ov || {};
                _merge(pv, ov);
                dst[p] = ov;
            } else
                dst[p] = pv;
        }
    },
    _destroyObjects = function (obj) {
        Object.keys(obj).forEach(pn => {
            let o = obj[pn];
            if (o && o.destroy)
                o.destroy();
            obj[pn] = null;
        });

    },
    _clone = function (src: any): any {
        if (!src) return src;
        let tt = typeof src;
        if (tt === 'object') {
            if (Array.isArray(src))
                return _copyArray(src, true);
            else
                return _copyObject(null, src, true);
        } else
            return src;
    },
    _format = function (...args: any[]): string {
        return args[0].replace(/{(\d+)}/g, function (match, num) {
            num = parseInt(num, 10);
            return args[num + 1];
        });
    };


export var merge = _merge;
export var clone = _clone;
export var destroy = _destroyObjects;
export var format = _format;