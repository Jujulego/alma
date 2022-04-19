import { api } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const useUSAPopulation = api('https://datausa.io/api/data?drilldowns=Nation&measures=Population');

// Component
export const ApiData: FC<{ n: number }> = () => {
  const { data, isLoading } = useUSAPopulation();

  return (
    <>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
