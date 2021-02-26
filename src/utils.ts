import { AnyObject } from './typings';

export function deepClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj));
}

export function typeOf<T>(obj: T): string {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

export function isUndefined(val: any): boolean {
  return val === undefined;
}

export function isObject(obj: AnyObject): boolean {
  return typeOf(obj) === 'Object';
}

export function isEmptyObject(obj: AnyObject): boolean {
  return Object.keys(obj).length === 0;
}
