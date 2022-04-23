import { api, $post } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const useUSAPopulation = api<number>('https://datausa.io/api/data?drilldowns=Nation&measures=Population')
  .mutation('add', $post<number, string>(), '/add', (old, res) => old + res);

useUSAPopulation.prefetch();

// Component
export const ApiData: FC<{ n: number }> = () => {
  const { data, isLoading, add } = useUSAPopulation();

  return (
    <>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
