import { ApiDataResultEffect, ApiDataResultSuspense, RequestOptions, useApiData } from './hooks';
import { ApiDataConstraint as ADC, ApiResponseType, ApiResponseTypeFor as ARTF } from './types';
import { ApiUrl, urlBuilder } from './utils';

// Types
export type ApiOptionsEffect<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense: false;
}

export type ApiOptionsSuspense<RT extends ApiResponseType> = RequestOptions<RT> & {
  suspense?: true;
}

export type ApiOptions<RT extends ApiResponseType> = ApiOptionsEffect<RT> | ApiOptionsSuspense<RT>;

export interface ApiHookEffect<D, A> {
  (arg: A): ApiDataResultEffect<D>;
}

export interface ApiHookSuspense<D, A> {
  (arg: A): ApiDataResultSuspense<D>;
}

export type ApiHook<D, A> = ApiHookEffect<D, A> | ApiHookSuspense<D, A>;

// Hook builder
export function api<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'arraybuffer'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'blob'> = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'blob'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'json'> = ADC<'json'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'json'>): ApiHookEffect<D, A>;
export function api<D extends ADC<'text'> = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ApiOptionsEffect<'text'>): ApiHookEffect<D, A>;

export function api<D extends ADC<'arraybuffer'> = ADC<'arraybuffer'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'arraybuffer'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'blob'> = ADC<'blob'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'blob'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'json'> = ADC<'json'>, A = void>(url: ApiUrl<A>, options?: ApiOptionsSuspense<'json'>): ApiHookSuspense<D, A>;
export function api<D extends ADC<'text'> = ADC<'text'>, A = void>(url: ApiUrl<A>, options: ApiOptionsSuspense<'text'>): ApiHookSuspense<D, A>;

export function api<D, A>(url: ApiUrl<A>, options?: ApiOptions<ARTF<D>>): ApiHook<D, A> {
  return (arg: A) => useApiData<D>(urlBuilder(url)(arg), options);
}
