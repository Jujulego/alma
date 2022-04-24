import { api } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const useUSAPopulation = api<number>('https://datausa.io/api/data', {
  query: {
    drilldowns: 'Nation',
    measures: 'Population'
  }
});

useUSAPopulation.prefetch(undefined, { n: 0 });

// Component
export const ApiData: FC<{ n: number }> = ({ n }) => {
  const { data, isLoading } = useUSAPopulation(undefined, { n: n % 2 });

  return (
    <>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
