import { createClient, Client } from 'graphql-ws';
import { FC, useEffect, useState } from 'react';

import { GqlSubscriptionContext } from './GqlSubscriptionContext';

// Types
export interface GqlSubscriptionClientProps {
  endpoint: string;
}

// Component
export const GqlSubscriptionClient: FC<GqlSubscriptionClientProps> = (props) => {
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
    <GqlSubscriptionContext.Provider value={{ client }}>
      { children }
    </GqlSubscriptionContext.Provider>
  );
};