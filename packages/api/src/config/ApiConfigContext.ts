import { createContext } from 'react';

import { ApiConfig } from '../types';
import { globalApiConfig } from './config';

// Context
export const ApiConfigContext = createContext<ApiConfig>(globalApiConfig());
