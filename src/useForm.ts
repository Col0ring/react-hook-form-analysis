import React from 'react';

import { createFormControl } from './logic/createFormControl';
import getProxyFormState from './logic/getProxyFormState';
import shouldRenderFormState from './logic/shouldRenderFormState';
import {
  FieldErrors,
  FieldNamesMarkedBoolean,
  FieldValues,
  FormState,
  UseFormProps,
  UseFormReturn,
} from './types';
import { useSubscribe } from './useSubscribe';

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
>(
  // TFieldValues 在外部用户自己传入
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext> {
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext> | undefined
  >();
  // formState 实时更新
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    dirtyFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitted: false,
    submitCount: 0,
    touchedFields: {} as FieldNamesMarkedBoolean<TFieldValues>,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    errors: {} as FieldErrors<TFieldValues>,
  });

  // 保证 formControl 不重复渲染
  if (_formControl.current) {
    _formControl.current.control._options = props;
  } else {
    _formControl.current = {
      ...createFormControl(props),
      formState,
    };
  }

  // control 不会改变地址
  const control = _formControl.current.control;

  /**
   * 当 subject 更新值时调用
   */
  const callback = React.useCallback(
    (value: FieldValues) => {
      if (shouldRenderFormState(value, control._proxyFormState, true)) {
        control._formState = {
          ...control._formState,
          ...value,
        };

        // 更新 fromState
        updateFormState({ ...control._formState });
      }
    },
    [control],
  );

  /**
   * 所有使用 useForm 的表单最外层都会监听 state，此值改变整个表单状态都会改变，watch 性能更差也是因为间距会发布 state 的更新导致这里更新
   */
  useSubscribe({
    subject: control._subjects.state,
    callback,
  });

  // 每次渲染的时候都会触发
  React.useEffect(() => {
    // 如果没有挂载，就挂载
    if (!control._stateFlags.mount) {
      // 挂载的同时验证表单
      control._proxyFormState.isValid && control._updateValid();
      control._stateFlags.mount = true;
    }
    // 如果 shouldUnregister 为 true 会触发这里
    if (control._stateFlags.watch) {
      control._stateFlags.watch = false;
      control._subjects.state.next({});
    }
    // 每次渲染都会判断溢出没有 mount 的表单项
    control._removeUnmounted();
  });

  // 代理 fromState，内部做依赖收集
  _formControl.current.formState = getProxyFormState(
    formState,
    control._proxyFormState,
  );

  return _formControl.current;
}
