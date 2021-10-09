import { ApiGetRequestConfig, ApiPromise } from '@jujulego/alma-api';
import { useCallback } from 'react';

import { useQueryRequest, useMutationRequest, GqlQueryState } from './gql';
import { GqlDocument, GqlVariables } from './types';
import { buildRequest } from './utils';

// Types
export type GqlMerge<S, R> = (state: S | undefined, res: R) => S | undefined;

export type GqlStateMethods<N extends string, DM, VM extends GqlVariables> = {
  [key in N]: (vars: VM) => ApiPromise<DM>;
}

export type GqlHook<D, V extends GqlVariables, S extends GqlQueryState<D>> =
  ((vars: V, config?: ApiGetRequestConfig) => S) & GqlHookMethods<D, V, S>;

export interface GqlHookMethods<D, V extends GqlVariables, S extends GqlQueryState<D>> {
  mutation<N extends string, DM = D, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateMethods<N, DM, VM>>
}

// Utils
function hookMethods<D, V extends GqlVariables, S extends GqlQueryState<D>>(url: string): GqlHookMethods<D, V, S> {
  return {
    mutation<N extends string, DM, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>) {
      return addMutateCall<N, D, DM, V, VM, S>(url, name, doc, this, merge);
    }
  };
}

// Hook modifiers
function addMutateCall<N extends string, D, DM, V extends GqlVariables, VM extends GqlVariables, S extends GqlQueryState<D>>(url: string, name: N, doc: GqlDocument<DM, VM>, wrapped: GqlHook<D, V, S>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateMethods<N, DM, VM>> {
  const req = buildRequest(doc);

  // Modified hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): S & GqlStateMethods<N, DM, VM> {
    // Api
    const { send } = useMutationRequest<DM, VM>(url, req, config);
    const all = wrapped(vars, config);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((vars: VM) => {
        return send(vars).then((res) => {
          update((state) => merge(state, res) as D);
          return res;
        });
      }, [update, send])
    } as GqlStateMethods<N, DM, VM>);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, S & GqlStateMethods<N, DM, VM>>(url));
}

// Hook builder
export function gqlResource<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V>): GqlHook<D, V, GqlQueryState<D>> {
  // Build request
  const req = buildRequest(doc);

  if (!req.operationName) {
    console.warn('No operation name found in document, result will not be cached');
  }

  // Hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): GqlQueryState<D> {
    return useQueryRequest<D, V>(url, req, vars, config);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, GqlQueryState<D>>(url));
}