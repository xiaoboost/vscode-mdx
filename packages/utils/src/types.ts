export type GetConstructorParameter<T> = T extends { new (...args: infer R): any } ? R : never;

export interface OffsetRange {
  start: number;
  end: number;
}
