import { useInterval } from '@jujulego/alma-utils';
import { FC } from 'react';

import { ApiData } from './ApiData';

// Component
export const App: FC = () => {
  useInterval(5000);

  return (
    <ApiData />
  );
};
