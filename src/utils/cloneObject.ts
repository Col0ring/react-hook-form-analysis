import isFunction from './isFunction';
import isObject from './isObject';
import isWeb from './isWeb';

/**
 * 如果是对象，使用对象的副本
 * @param data
 * @returns
 */
export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (
    !(isWeb && (data instanceof Blob || data instanceof FileList)) &&
    (isArray || isObject(data))
  ) {
    copy = isArray ? [] : {};
    for (const key in data) {
      if (isFunction(data[key])) {
        copy = data;
        break;
      }
      copy[key] = cloneObject(data[key]);
    }
  } else {
    return data;
  }

  return copy;
}
