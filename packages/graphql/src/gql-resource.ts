import { ApiGetRequestConfig, ApiPromise } from '@jujulego/alma-api';
import { useCallback, useEffect } from 'react';

import { useQueryRequest, useMutationRequest, useSubscriptionRequest, GqlQueryState } from './gql';
import { GqlDocument, GqlVariables } from './types';
import { buildRequest } from './utils';

// Types
export type GqlMerge<S, R> = (state: S | undefined, res: R) => S | undefined;

export type GqlStateMutateMethods<N extends string, DM, VM extends GqlVariables> = {
  [key in N]: (vars: VM) => ApiPromise<DM>;
}

export type GqlStateSubscribeMethods<N extends string, VS extends GqlVariables> = {
  [key in N]: (vars: VS) => (() => void);
}

export type GqlHook<D, V extends GqlVariables, S extends GqlQueryState<D>> = ((vars: V, config?: ApiGetRequestConfig) => S) & GqlHookMethods<D, V, S>;

export interface GqlHookMethods<D, V extends GqlVariables, S extends GqlQueryState<D>> {
  mutation<N extends string, DM = D, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateMutateMethods<N, DM, VM>>
  subscription<N extends string, DS = D, VS extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DS, VS>, merge: GqlMerge<D, DS>): GqlHook<D, V, S & GqlStateSubscribeMethods<N, VS>>
}

// Utils
function hookMethods<D, V extends GqlVariables, S extends GqlQueryState<D>>(url: string): GqlHookMethods<D, V, S> {
  return {
    mutation<N extends string, DM, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DM, VM>, merge: GqlMerge<D, DM>) {
      return addMutateCall<N, D, DM, V, VM, S>(url, name, doc, this, merge);
    },
    subscription<N extends string, DS, VS extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument<DS, VS>, merge: GqlMerge<D, DS>) {
      return addSubscribeCall<N, D, DS, V, VS, S>(url, name, doc, this, merge);
    }
  };
}

// Hook modifiers
function addMutateCall<N extends string, D, DM, V extends GqlVariables, VM extends GqlVariables, S extends GqlQueryState<D>>(url: string, name: N, doc: GqlDocument<DM, VM>, wrapped: GqlHook<D, V, S>, merge: GqlMerge<D, DM>): GqlHook<D, V, S & GqlStateMutateMethods<N, DM, VM>> {
  const req = buildRequest(doc);

  // Modified hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): S & GqlStateMutateMethods<N, DM, VM> {
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
    } as GqlStateMutateMethods<N, DM, VM>);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, S & GqlStateMutateMethods<N, DM, VM>>(url));
}

function addSubscribeCall<N extends string, D, DS, V extends GqlVariables, VS extends GqlVariables, S extends GqlQueryState<D>>(url: string, name: N, doc: GqlDocument<DS, VS>, wrapped: GqlHook<D, V, S>, merge: GqlMerge<D, DS>): GqlHook<D, V, S & GqlStateSubscribeMethods<N, VS>> {
  const req = buildRequest(doc);

  // Modified hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): S & GqlStateSubscribeMethods<N, VS> {
    // Api
    const { subscribe, data } = useSubscriptionRequest<DS, VS>(req);
    const all = wrapped(vars, config);
    const { update } = all;

    // Effects
    useEffect(() => {
      if (data) {
        update((state) => merge(state, data) as D);
      }
    }, [update, data]);

    // Result
    return Object.assign(all, {
      [name]: subscribe,
    } as GqlStateSubscribeMethods<N, VS>);
  }

  return Object.assign(useGqlResource, hookMethods<D, V, S & GqlStateSubscribeMethods<N, VS>>(url));
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