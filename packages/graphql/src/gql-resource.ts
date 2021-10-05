import { ApiGetRequestConfig, ApiParams, ApiPromise, Updator, usePostRequest } from '@jujulego/alma-api';
import { useDeepMemo } from '@jujulego/alma-utils';
import axios, { CancelTokenSource } from 'axios';
import { useCallback } from 'react';

import { GqlDocument, GqlErrorResponse, GqlResponse, GqlVariables } from './types';
import { buildRequest } from './utils';
import { useQueryRequest } from './gql/useQueryRequest';

// Types
export interface IGqlResourceState<T, E = unknown> {
  loading: boolean;
  data?: T;
  error?: E | GqlErrorResponse;

  reload: () => void;
  update: (data: T | Updator<T>) => void;
}

export type IGqlResourceMutateState<N extends string, TM, VM extends GqlVariables> = {
  [key in N]: (vars: VM) => ApiPromise<TM>;
}

export type GqlResourceHook<T, V extends GqlVariables, S extends IGqlResourceState<T, E>, E = unknown> = ((vars: V, config?: ApiGetRequestConfig) => S) & IGqlResourceHookMethods<T, V, S, E>;

export type GqlMerge<S, R> = (state: S | undefined, res: R) => S;

export interface IGqlResourceHookMethods<T, V extends GqlVariables, S extends IGqlResourceState<T, E>, E = unknown> {
  mutation: <N extends string, TM, VM extends GqlVariables = GqlVariables>(name: N, doc: GqlDocument, merge: GqlMerge<T, TM>) => GqlResourceHook<T, V, S & IGqlResourceMutateState<N, TM, VM>, E>
}

// Utils
function hookMethods<T, V extends GqlVariables, S extends IGqlResourceState<T, E>, E = unknown>(url: string): IGqlResourceHookMethods<T, V, S, E> {
  return {
    mutation<N extends string, TM, VM extends GqlVariables>(name: N, doc: GqlDocument, merge: GqlMerge<T, TM>) {
      return addMutateCall<N, TM, VM, T, V, S, E>(url, name, doc, this, merge);
    }
  };
}

// Hook modifiers
function addMutateCall<N extends string, TM, VM extends GqlVariables, T, V extends GqlVariables, S extends IGqlResourceState<T, E>, E = unknown>(url: string, name: N, doc: GqlDocument, wrapped: GqlResourceHook<T, V, S, E>, merge: GqlMerge<T, TM>): GqlResourceHook<T, V, S & IGqlResourceMutateState<N, TM, VM>, E> {
  const req = buildRequest(doc);

  // Modified hook
  function useGqlResource(vars: V, config?: ApiGetRequestConfig): S & IGqlResourceMutateState<N, TM, VM> {
    // Stabilise objects
    const sconfig = useDeepMemo(config);

    // Callbacks
    const generator = useCallback(
      (vars: VM, source: CancelTokenSource) => axios.post<GqlResponse<TM>>(url, { ...req, variables: vars }, { ...sconfig, cancelToken: source.token }),
      [sconfig]
    );

    // Api
    const { send } = usePostRequest<VM, GqlResponse<TM>, ApiParams, E | GqlErrorResponse>(generator);
    const all = wrapped(vars, config);

    // Result
    const { update } = all;

    return Object.assign(all, {
      [name]: useCallback((vars: VM) => {
        return send(vars).then((res) => {
          update((state) => merge(state, res.data));
          return res.data;
        });
      }, [update, send])
    } as IGqlResourceMutateState<N, TM, VM>);
  }

  return Object.assign(useGqlResource, hookMethods<T, V, S & IGqlResourceMutateState<N, TM, VM>, E>(url));
}

// Hook builder
export function gqlResource<T, V extends GqlVariables, E = unknown>(url: string, doc: GqlDocument): GqlResourceHook<T, V, IGqlResourceState<T, E>> {
  // Build request
  const req = buildRequest(doc);

  if (!req.operationName) {
    console.warn('No operation name found in document, result won\'t be cached');
  }

  // Hook
  function useGqlResource(vars: V, config: ApiGetRequestConfig = {}): IGqlResourceState<T, E> {
    return useQueryRequest<T, V, E>(url, req, vars, config);
  }

  return Object.assign(useGqlResource, hookMethods<T, V, IGqlResourceState<T, E>, E>(url));
}