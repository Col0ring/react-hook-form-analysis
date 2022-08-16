import { FieldValues, InternalFieldName, Names } from '../types';
import get from '../utils/get';
import isString from '../utils/isString';

export default (
  names: string | string[] | undefined,
  _names: Names,
  // 当前的 from 的 values 值
  formValues?: FieldValues,
  // 全局的 watch 会把字段名添加到 _names 的 watch 集合中
  isGlobal?: boolean,
) => {
  const isArray = Array.isArray(names);
  if (isString(names)) {
    isGlobal && _names.watch.add(names as InternalFieldName);
    return get(formValues, names as InternalFieldName);
  }

  if (isArray) {
    return names.map(
      (fieldName) => (
        isGlobal && _names.watch.add(fieldName as InternalFieldName),
        get(formValues, fieldName as InternalFieldName)
      ),
    );
  }

  // 如果上面都没匹配上，证明 _names 正在 watchAll
  isGlobal && (_names.watchAll = true);
  return formValues;
};
