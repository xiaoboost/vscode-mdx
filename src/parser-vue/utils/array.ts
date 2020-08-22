type Index = string | number;
type IndexCb<T, U> = (val: T, index: number) => U;

export function toMap<T extends object, U extends Index>(arr: T[], toKey: IndexCb<T, U>): Record<U, T | undefined>;
export function toMap<T extends object, U extends Index, V>(arr: T[], toKey: IndexCb<T, U>, toVal: IndexCb<T, V>): Record<U, V | undefined>
export function toMap<T extends object, U extends Index, V>(arr: T[], toKey: IndexCb<T, U>, toVal?: IndexCb<T, V>) {
    const map: Record<U, any> = {} as any;

    if (toVal) {
        arr.forEach((val, i) => (map[toKey(val, i)] = toVal(val, i)));
    }
    else {
        arr.forEach((val, i) => (map[toKey(val, i)] = val));
    }

    return map;
}

/** 生成`hash`布尔查询表 */
export function toBoolMap<T extends Index>(arr: T[]): Record<T, boolean>;
export function toBoolMap<T, U extends Index>(arr: T[], cb: IndexCb<T, U>): Record<U, boolean>;
export function toBoolMap<T, U extends Index>(arr: T[], cb?: IndexCb<T, U>) {
    const map: Record<Index, boolean> = {};

    if (!cb) {
        arr.forEach((key) => (map[key as any] = true));
    }
    else {
        arr.forEach((key, i) => (map[cb(key, i)] = true));
    }

    return map;
}
