import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useMemo } from 'react';

import { ApiAutoLoadState, useApiAutoLoad, useApiGet } from './api';
import { ApiPromise } from './api-promise';
import { ApiResponse } from './types';

// Constants
const API_GET_HOOKS = {
  get: useApiGet,
  // head: useApiHead,
  // options: useApiOptions,
  // delete: useApiDelete,
};

// const API_POST_HOOKS = {
//   post: useApiPost,
//   patch: useApiPatch,
//   put: useApiPut,
// };

// Types
export type ApiUrlBuilder<A> = (args: A) => string;
export type ApiMerge<S, R> = (state: S | undefined, res: R | undefined) => S | undefined;

export type ApiStateGetMethod<N extends string, RM> = {
  [key in N]: () => ApiPromise<ApiResponse<RM>>
}

// export type ApiStatePostMethod<N extends string, BM, RM, PM extends ApiParams> = {
//   [key in N]: (body: BM, params?: PM) => ApiPromise<ApiResult<RM>>
// }

export type ApiHook<R, A, S extends ApiAutoLoadState<R>> = ((args: A) => S);// & ApiHookMethods<R, P, A, S>;

export interface ApiHookMethods<R, A, S extends ApiAutoLoadState<R>> {
  get<N extends string, RM = R>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, A, S & ApiStateGetMethod<N, RM>>;
  // head<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  // options<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  // delete<N extends string, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStateGetMethod<N, RM, PM>>;
  // patch<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
  // post<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
  // put<N extends string, BM, RM = R, PM extends ApiParams = P>(name: N, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>;
}

// Utils
function hookMethods<R, A, S extends ApiAutoLoadState<R>>(url: ApiUrlBuilder<A>): ApiHookMethods<R, A, S> {
  return {
    get<N extends string, RM>(name: N, merge: ApiMerge<R, RM>) {
      return addGetCall<N, R, RM, A, S>(name, 'get', url, this, merge);
    },
//     head<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addGetCall<N, R, RM, P, PM, A, S>(name, 'head', url, this, merge);
//     },
//     options<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addGetCall<N, R, RM, P, PM, A, S>(name, 'options', url, this, merge);
//     },
//     delete<N extends string, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addGetCall<N, R, RM, P, PM, A, S>(name, 'delete', url, this, merge);
//     },
//     patch<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'patch', url, this, merge);
//     },
//     post<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'post', url, this, merge);
//     },
//     put<N extends string, BM, RM, PM extends ApiParams>(name: N, merge: ApiMerge<R, RM>) {
//       return addPostCall<N, BM, R, RM, P, PM, A, S>(name, 'put', url, this, merge);
//     }
  };
}

// Hook modifier
function addGetCall<N extends string, R, RM, A, S extends ApiAutoLoadState<R>>(name: N, method: keyof typeof API_GET_HOOKS, builder: ApiUrlBuilder<A>, wrapped: ApiHook<R, A, S>, merge: ApiMerge<R, RM>): ApiHook<R, A, S & ApiStateGetMethod<N, RM>> {
  // Hook
  function useApiResource(args: A): S & ApiStateGetMethod<N, RM> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    const { send } = API_GET_HOOKS[method]<RM>(url);
    const all = wrapped(args);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback(() => {
        return send().then((res) => {
          update(old => merge(old, res.data));
          return res;
        });
      }, [send, update]),
    } as ApiStateGetMethod<N, RM>);
  }

  return Object.assign(useApiResource, hookMethods<R, A, S & ApiStateGetMethod<N, RM>>(builder));
}

// function addPostCall<N extends string, BM, R, RM, P extends ApiParams, PM extends ApiParams, A, S extends ApiGetState<R, P>>(name: N, method: keyof typeof API_POST_HOOKS, builder: ApiUrlBuilder<A>, wrapped: ApiHook<R, P, A, S>, merge: ApiMerge<R, RM>): ApiHook<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>> {
//   // Hook
//   function useApiResource(args: A, params?: P): S & ApiStatePostMethod<N, BM, RM, PM> {
//     // Url
//     const sargs = useDeepMemo(args);
//     const url = useMemo(() => builder(sargs), [sargs]);
//
//     // Api
//     const { send } = API_POST_HOOKS[method]<BM, RM, PM>(url);
//     const all = wrapped(args, params);
//
//     // Result
//     const { update } = all;
//
//     return Object.assign(all, {
//       [name]: useCallback((body: BM, params?: PM) => {
//         return send(body, params).then((res) => {
//           update(old => merge(old, res.data));
//           return res;
//         });
//       }, [send, update]),
//     } as ApiStatePostMethod<N, BM, RM, PM>);
//   }
//
//   return Object.assign(useApiResource, hookMethods<R, P, A, S & ApiStatePostMethod<N, BM, RM, PM>>(builder));
// }

// Hook builder
export function apiResource<R, A = void>(url: string | ApiUrlBuilder<A>): ApiHook<R, A, ApiAutoLoadState<R>> {
  const builder = typeof url === 'string' ? () => url : url;

  // Hook
  function useApiResource(args: A): ApiAutoLoadState<R> {
    // Url
    const sargs = useDeepMemo(args);
    const url = useMemo(() => builder(sargs), [sargs]);

    // Api
    return useApiAutoLoad<'get', R>(useApiGet, url);
  }

  return Object.assign(useApiResource, hookMethods<R, A, ApiAutoLoadState<R>>(builder));
}
