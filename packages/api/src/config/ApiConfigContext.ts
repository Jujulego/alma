import { createContext } from 'react';

import { ApiConfig, globalApiConfig } from './config';

// Context
export const ApiConfigContext = createContext<ApiConfig>(globalApiConfig());
