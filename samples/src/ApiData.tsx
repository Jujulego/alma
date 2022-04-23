import { api, $get, $url, useApi } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const useUSAPopulation = api('https://datausa.io/api/data?drilldowns=Nation&measures=Population');
useUSAPopulation.prefetch();

// Component
export const ApiData: FC<{ n: number }> = () => {
  const { data, isLoading } = useUSAPopulation();

  const send = useApi($get(), $url`/test/${'id'}`, { responseType: 'arraybuffer' });
  const res = send({ id: 'test' });

  return (
    <>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
