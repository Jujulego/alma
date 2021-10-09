import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { GqlSubscriptionContext, GqlWsStatus } from './GqlSubscriptionContext';
import {
  GqlSubscriptionClientMessage,
  GqlSubscriptionServerDataMessage,
  GqlSubscriptionServerMessage
} from './messages';
import { GqlRequest } from '../types';

// Types
export interface GqlSubscriptionClientProps {
  endpoint: string;
}

// Component
export const GqlSubscriptionClient: FC<GqlSubscriptionClientProps> = (props) => {
  const { endpoint, children } = props;

  // States
  const [message, setMessage] = useState<GqlSubscriptionServerDataMessage>();
  const [status, setStatus] = useState<GqlWsStatus>();

  // Refs
  const wsRef = useRef<WebSocket>();

  // Callbacks
  const send = useCallback((message: GqlSubscriptionClientMessage) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('Trying to send message with no connection ...');
    }
  }, []);

  const request = useCallback((id: string, req: GqlRequest) => {
    send({
      type: 'GQL_START',
      id,
      payload: req,
    });
  }, [send]);

  const unsubscribe = useCallback((id: string) => {
    send({
      type: 'GQL_STOP',
      id,
    });
  }, [send]);

  // Effects
  useEffect(() => {
    const ws = wsRef.current = new WebSocket(endpoint);
    setStatus('connecting');
    let status = 'connecting';

    ws.addEventListener('message', (event: MessageEvent<GqlSubscriptionServerMessage>) => {
      switch (event.data.type) {
        case 'GQL_DATA':
        case 'GQL_ERROR':
        case 'GQL_COMPLETE':
          setMessage(event.data);
          break;

        case 'GQL_CONNECTION_ACK':
          setStatus('connected');
          status = 'connected';
          break;

        case 'GQL_CONNECTION_ERROR':
          console.error(`Failed to connect to ${endpoint}`);
          console.error(event.data);

          setStatus('closed');
          status = 'closed';

          ws.close();
          break;
      }
    });

    send({ type: 'GQL_CONNECTION_INIT' });

    return () => {
      if (status === 'connected') {
        send({ type: 'GQL_CONNECTION_TERMINATE' });
      }

      ws.close();

      setStatus('closed');
      status = 'closed';
    };
  }, [endpoint, send]);

  // Render
  return (
    <GqlSubscriptionContext.Provider
      value={{
        status,
        message,

        request,
        unsubscribe
      }}
    >
      { children }
    </GqlSubscriptionContext.Provider>
  );
};