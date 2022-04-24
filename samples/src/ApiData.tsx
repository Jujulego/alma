import { api } from '@jujulego/alma-api';
import { FC, useCallback, useTransition } from 'react';

// Constants
const useUSAPopulation = api<number>('https://datausa.io/api/data', {
  query: {
    drilldowns: 'Nation',
    measures: 'Population'
  },
  suspense: true,
});

useUSAPopulation.prefetch();

// Component
export const ApiData: FC<{ n: number }> = () => {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, refresh } = useUSAPopulation();

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      refresh();
    });
  }, [refresh]);

  return (
    <>
      <p>
        Status: <strong>{ (isLoading || isPending) ? 'loading ...' : 'done' }</strong>
        <button onClick={handleRefresh}>refresh</button>
      </p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
