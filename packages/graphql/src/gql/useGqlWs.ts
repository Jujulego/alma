import { useDeepMemo } from '@jujulego/alma-utils';
import { useCallback, useContext, useMemo, useState } from 'react';

import { GqlCancel, GqlDocument, GqlSink, GqlVariables } from '../types';
import { buildRequest } from '../utils';
import { GqlWsContext } from '../ws';

// Types
export interface GqlWsState<D, V extends GqlVariables> {
  /**
   * Indicates if the request is running.
   */
  loading: boolean;

  /**
   * Send the given graphql subscription
   *
   * @param vars to send with the document
   */
  subscribe: (vars: V, sink: GqlSink<D>) => GqlCancel;
}

// Hook
export function useGqlWs<D, V extends GqlVariables = GqlVariables>(url: string, doc: GqlDocument<D, V>): GqlWsState<D, V> {
  // Build request
  const sdoc = useDeepMemo(doc);
  const req = useMemo(() => buildRequest(sdoc), [sdoc]);

  // State
  const [loading, setLoading] = useState(false);

  // Context
  const { client } = useContext(GqlWsContext);

  // Return
  return {
    loading,
    subscribe: useCallback((vars, sink) => {
      if (!client) {
        console.warn('websocket client not found, subscription will not be send');
        return () => undefined;
      }

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