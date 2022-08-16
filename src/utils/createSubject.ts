import { Noop } from '../types';

/**
 * 感觉参考自 Rxjs
 */

export type Observer<T> = {
  next: (value: T) => void;
};

export type Subscription = {
  unsubscribe: Noop;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: Noop;
} & Observer<T>;
/**
 * 类似 rxjs 的 subject，内部是一套发布订阅模式
 * @returns
 */
export default function createSubject<T>(): Subject<T> {
  let _observers: Observer<T>[] = [];

  const next = (value: T) => {
    for (const observer of _observers) {
      observer.next(value);
    }
  };

  const subscribe = (observer: Observer<T>): Subscription => {
    _observers.push(observer);
    return {
      unsubscribe: () => {
        _observers = _observers.filter((o) => o !== observer);
      },
    };
  };

  const unsubscribe = () => {
    _observers = [];
  };

  return {
    get observers() {
      return _observers;
    },
    next,
    subscribe,
    unsubscribe,
  };
}
