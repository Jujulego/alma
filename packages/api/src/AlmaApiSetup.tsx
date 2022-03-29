import { FC } from 'react';

import { SwrCache } from './cache';
import { ApiConfig, ApiConfigProps } from './config';

// Props
export interface AlmaApiSetupProps extends ApiConfigProps {
  globalCache?: boolean;
}

// Component
export const AlmaApiSetup: FC<AlmaApiSetupProps> = (props) => {
  const { globalCache = false, children, ...config } = props;

  // Render
  let content = <>{ children }</>;

  if (globalCache) {
    content = <SwrCache>{ children }</SwrCache>;
  }

  return <ApiConfig {...config}>{ content }</ApiConfig>;
};
