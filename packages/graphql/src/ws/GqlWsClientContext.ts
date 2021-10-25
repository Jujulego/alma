import { Client } from 'graphql-ws';
import { createContext } from 'react';

// Types
export interface GqlWsClientState {
  client?: Client;
}

// Context
export const GqlWsClientContext = createContext<GqlWsClientState>({});
