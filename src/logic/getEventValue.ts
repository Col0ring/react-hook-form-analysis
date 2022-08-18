import isCheckBoxInput from '../utils/isCheckBoxInput';
import isObject from '../utils/isObject';

type Event = { target: any };

/**
 * 获取受控表单的值
 */
export default (event: unknown) =>
  isObject(event) && (event as Event).target
    ? isCheckBoxInput((event as Event).target)
      ? (event as Event).target.checked
      : (event as Event).target.value
    : event;
