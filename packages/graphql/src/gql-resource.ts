import { ApiGetRequestConfig, ApiPromise, Updator } from '@jujulego/alma-api';
import { useCallback } from 'react';

import { useQueryRequest, useMutationRequest } from './gql';
import { GqlDocument, GqlErrorResponse, GqlVariables } from './types';
import { buildRequest } from './utils';

// Types
export type Holder<V> = { _?: V };
export type GqlMerge<S, R> = (state: S | undefined, res: R) => S | undefined;

export interface GqlState<T> {
  loading: boolean;
  data?: T;
  error?: GqlErrorResponse;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export type GqlStateMethods<N extends string, TM, VM extends GqlVariables> = {
  [key in N]: (vars: VM) => ApiPromise<TM>;
}

export type GqlHook<T, V extends GqlVariables, S extends GqlState<T>> = ((vars: V, config?: ApiGetRequestConfig) => S) & GqlHookMethods<T, V, S>;

export interface GqlHookMethods<T, V extends GqlVariables, S extends GqlState<T>> {
  mutation: <N extends string, TM = T, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument, merge: GqlMerge<T, TM>, _?: Holder<VM>) => GqlHook<T, V, S & GqlStateMethods<N, TM, VM>>
}

// Utils
export function gqlVars<V extends GqlVariables>(): Holder<V> {
  return {};
}

function hookMethods<T, V extends GqlVariables, S extends GqlState<T>>(url: string): GqlHookMethods<T, V, S> {
  return {
    mutation<N extends string, TM, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument, merge: GqlMerge<T, TM>) {
      return addMutateCall<N, TM, VM, T, V, S>(url, name, doc, this, merge);
    }
  };
}

// Hook modifiers
function addMutateCall<N extends string, TM, VM extends GqlVariables, T, V extends GqlVariables, S extends GqlState<T>>(url: string, name: N, doc: GqlDocument, wrapped: GqlHook<T, V, S>, merge: GqlMerge<T, TM>): GqlHook<T, V, S & GqlStateMethods<N, TM, VM>> {
  const req = buildRequest(doc);

  // Modified hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): S & GqlStateMethods<N, TM, VM> {
    // Api
    const { send } = useMutationRequest<TM, VM>(url, req, config);
    const all = wrapped(vars, config);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((vars: VM) => {
        return send(vars).then((res) => {
          update((state) => merge(state, res) as T);
          return res;
        });
      }, [update, send])
    } as GqlStateMethods<N, TM, VM>);
  }

  return Object.assign(useGqlResource, hookMethods<T, V, S & GqlStateMethods<N, TM, VM>>(url));
}

// Hook builder
export function gqlResource<T, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument, _?: Holder<V>): GqlHook<T, V, GqlState<T>> {
  // Build request
  const req = buildRequest(doc);

  if (!req.operationName) {
    console.warn('No operation name found in document, result will not be cached');
  }

  // Hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): GqlState<T> {
    return useQueryRequest<T, V>(url, req, vars, config);
  }

  return Object.assign(useGqlResource, hookMethods<T, V, GqlState<T>>(url));
}