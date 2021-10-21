import { createClient, Client } from 'graphql-ws';
import { FC, useEffect, useState } from 'react';

import { GqlWsClientContext } from './GqlWsClientContext';

// Types
export interface GqlWsClientProps {
  endpoint: string;
}

// Component
export const GqlWsClient: FC<GqlWsClientProps> = (props) => {
  const { endpoint, children } = props;

  // State
  const [client, setClient] = useState<Client>(createClient({ url: endpoint }));

  // Effects
  useEffect(() => {
    const ws = createClient({ url: endpoint });
    setClient(ws);

    return () => { ws.dispose(); };
  }, [endpoint, setClient]);

  // Render
  return (
    <GqlWsClientContext.Provider value={{ client }}>
      { children }
    </GqlWsClientContext.Provider>
  );
};