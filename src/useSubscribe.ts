import React from 'react';

import { Subject, Subscription } from './utils/createSubject';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
};

/**
 * 通过 subject 来 subscribe callback
 * @param props
 */
export function useSubscribe<T>(props: Props<T>) {
  const _props = React.useRef(props);
  _props.current = props;

  React.useEffect(() => {
    // 关闭 subscribe
    const tearDown = (subscription: Subscription | false) => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };

    const subscription =
      !props.disabled &&
      _props.current.subject.subscribe({
        next: _props.current.callback,
      });

    return () => tearDown(subscription);
  }, [props.disabled]);
}
