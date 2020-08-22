declare type PartPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
declare type Writeable<T extends AnyObject> = { -readonly [P in keyof T]: T[P] };
declare type Overwrite<T extends AnyObject, K extends AnyObject> = Omit<T, Extract<keyof T, keyof K>> & K;
declare type GetArray<T> = T extends (any | (infer R)[]) ? R[] : never;
declare type GetArrayItem<T> = T extends (infer R)[] ? R : never;
declare type AnyObject<T = unknown> = Record<string, T>;
declare type AnyFunction = (...args: any[]) => any;
declare type GetString<T> = T extends string ? T : never;
