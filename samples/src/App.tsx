import { useInterval } from '@jujulego/alma-utils';
import { FC } from 'react';

import { ApiData } from './ApiData';
import { GqlData } from './GqlData';

// Component
export const App: FC = () => {
  const n = useInterval(5000);

  return (
    // <ApiData n={0} />
    <GqlData n={n} />
  );
};
