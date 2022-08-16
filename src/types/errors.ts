import { FieldValues, InternalFieldName, Ref } from './fields';
import { BrowserNativeObject, LiteralUnion, Merge } from './utils';
import { RegisterOptions, ValidateResult } from './validator';

export type Message = string;

export type MultipleFieldErrors = {
  [K in keyof RegisterOptions]?: ValidateResult;
} & {
  [key: string]: ValidateResult;
};

export type FieldError = {
  type: LiteralUnion<keyof RegisterOptions, string>;
  root?: FieldError;
  ref?: Ref;
  types?: MultipleFieldErrors;
  message?: Message;
};

export type ErrorOption = {
  message?: Message;
  type?: LiteralUnion<keyof RegisterOptions, string>;
  types?: MultipleFieldErrors;
};

export type DeepRequired<T> = T extends BrowserNativeObject | Blob
  ? T
  : {
      [K in keyof T]-?: NonNullable<DeepRequired<T[K]>>;
    };

export type FieldErrorsImpl<T extends FieldValues = FieldValues> = {
  [K in keyof T]?: T[K] extends BrowserNativeObject | Blob
    ? FieldError
    : T[K] extends object
    ? Merge<FieldError, FieldErrorsImpl<T[K]>>
    : FieldError;
};

/**
 * errors，是一个包含 form 字段的对象 { xxx: object }
 */
export type FieldErrors<T extends FieldValues = FieldValues> = FieldErrorsImpl<
  DeepRequired<T>
>;

// 内部无法获取到具体的 form 自动，所以直接 string 做兼容
export type InternalFieldErrors = Partial<
  Record<InternalFieldName, FieldError>
>;
