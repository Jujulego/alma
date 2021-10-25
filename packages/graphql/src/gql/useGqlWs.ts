import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext, useMemo, useState } from 'react';

import { GqlCancel, GqlDocument, GqlRequest, GqlResponse, GqlSink, GqlVariables } from '../types';
import { buildRequest } from '../utils';
import { GqlWsClientContext } from '../ws';
import { ApiPromise, makeApiPromise } from '../../../api';

// Types
export interface GqlWsState<D, V extends GqlVariables> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Send the given graphql request
   *
   * @param vars to send with the document
   */
  send: (vars: V) => ApiPromise<GqlResponse<D>>;

  /**
   * Send the given graphql subscription
   *
   * @param vars to send with the document
   */
  subscribe: (vars: V, sink: GqlSink<D>) => GqlCancel;
}

// Hook
export function useGqlWs<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V> | GqlRequest<D, V>): GqlWsState<D, V> {
  // Build request
  const sdoc = useDeepMemo(doc);
  const req = useMemo(() => buildRequest(sdoc), [sdoc]);

  // State
  const [loading, setLoading] = useState(false);

  // Context
  const { client } = useContext(GqlWsClientContext);

  // Return
  return {
    loading,
    send: useCallback((vars) => {
      // Assert ws client is present
      if (!client) {
        console.warn('websocket client not found, request will not be send. Use <GqlWsClient> as a parent to fix this.');
        return makeApiPromise(new Promise(() => undefined), () => undefined);
      }

      // Send request
      setLoading(true);
      let cancel: GqlCancel = () => undefined;

      return makeApiPromise(
        new Promise((resolve, reject) => {
          cancel = client.subscribe<D>({ ...req, variables: vars }, {
            next(value) {
              resolve({
                data: value.data as D,
                errors: value.errors,
              });
            },
            complete() {
              setLoading(false);
            },
            error(error) {
              reject(error);
              setLoading(false);
            }
          });
        }),
        () => cancel()
      );
    }, [client, req]),
    subscribe: useCallback((vars, sink) => {
      // Assert ws client is present
      if (!client) {
        console.warn('websocket client not found, subscription will not be send.');
        return () => undefined;
      }

      // Send subscription
      setLoading(true);

      return client.subscribe<D>({ ...req, variables: vars }, {
        next(value) {
          sink.onData({
            data: value.data as D,
            errors: value.errors,
          });
        },
        complete() {
          setLoading(false);
        },
        error(error) {
          sink.onError(error);
          setLoading(false);
        }
      });
    }, [client, req]),
  };
}