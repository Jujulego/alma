import { ApiMethod } from '../types';

// Types
export type ApiTypedMethod<D, B> = ApiMethod & { __body?: B, __data?: D };

// Utils
export const $get = <D, B = undefined>(): ApiTypedMethod<D, B> => 'get';
export const $head = <D, B = undefined>(): ApiTypedMethod<D, B> => 'head';
export const $options = <D, B = undefined>(): ApiTypedMethod<D, B> => 'options';
export const $delete = <D, B = undefined>(): ApiTypedMethod<D, B> => 'delete';
export const $post = <D, B>(): ApiTypedMethod<D, B> => 'post';
export const $put = <D, B>(): ApiTypedMethod<D, B> => 'put';
export const $patch = <D, B>(): ApiTypedMethod<D, B> => 'patch';
