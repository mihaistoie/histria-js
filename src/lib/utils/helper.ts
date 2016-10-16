var _merge = function (src: any, dst: any): void {
    if (!src) return;
    for (let p in src) {
        let pv = src[p];
        let ov = dst[p];

        if (pv === null) continue;
        if (typeof pv === 'object' && !Array.isArray(pv)) {
            dst[p] = dst[p] || {};
            _merge(pv, dst[p]);
        } else
            dst[p] = pv;
    }
};


export var merge = _merge;