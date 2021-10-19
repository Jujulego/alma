import { ApiPromise } from '@jujulego/alma-api';
import { useCallback } from 'react';

import { GqlAutoLoadState, useGqlAutoLoad } from './gql';
import { GqlDocument, GqlQueryHook, GqlResponse, GqlVariables } from './types';
import { buildRequest } from './utils';

// Types
export type GqlMerge<D, DM> = (state: D | undefined, res: DM | undefined) => D | undefined;

export type GqlStateQueryMethod<N extends string, DM, VM extends GqlVariables> = {
  [key in N]: (vars: VM) => ApiPromise<GqlResponse<DM>>
}

export type GqlHook<D, V extends GqlVariables, S extends GqlAutoLoadState<D>> = ((vars: V) => S) & GqlHookMethods<D, V, S>;

export interface GqlHookMethods<D, V extends GqlVariables, S extends GqlAutoLoadState<D>> {
  query<N extends string, DM = D, VM extends GqlVariables = V>(name: N, hook: GqlQueryHook<DM, VM>, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateQueryMethod<N, DM, VM>>;
}

// Utils
function hookMethods<D, V extends GqlVariables, S extends GqlAutoLoadState<D>>(url: string): GqlHookMethods<D, V, S> {
  return {
    query<N extends string, DM, VM extends GqlVariables>(name: N, hook: GqlQueryHook<DM, VM>, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateQueryMethod<N, DM, VM>> {
      return addQueryCall<N, D, DM, V, VM, S>(url, this, name, hook, doc, merge);
    }
  };
}

// Hook modifier
function addQueryCall<N extends string, D, DM, V extends GqlVariables, VM extends GqlVariables, S extends GqlAutoLoadState<D>>(url: string, wrapped: GqlHook<D, V, S>, name: N, hook: GqlQueryHook<DM, VM>, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateQueryMethod<N, DM, VM>> {
  // Build request
  const req = buildRequest(doc);

  // Hook
  function useGqlResource(vars: V): S & GqlStateQueryMethod<N, DM, VM> {
    // Gql
    const { send } = hook(url, req);
    const all = wrapped(vars);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((vars: VM) => {
        return send(vars).then((res) => {
          update((old) => merge(old, res.data));
          return res;
        });
      }, [send, update]),
    } as GqlStateQueryMethod<N, DM, VM>);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, S & GqlStateQueryMethod<N, DM, VM>>(url));
}

// Hook builder
export function gqlResource<D, V extends GqlVariables = GqlVariables>(hook: GqlQueryHook<D, V>, url: string, doc: GqlDocument<D, V>): GqlHook<D, V, GqlAutoLoadState<D>> {
  // Build request
  const req = buildRequest(doc);

  // Hook
  function useGqlResource(vars: V): GqlAutoLoadState<D> {
    return useGqlAutoLoad<D, V>(hook, url, req, vars);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, GqlAutoLoadState<D>>(url));
}