import { url, useApi, useApiData } from '@jujulego/alma-api';
import { FC, useEffect } from 'react';

// Constants
const URL = 'https://datausa.io/api/data?drilldowns=Nation&measures=Population';

// Component
export const ApiData: FC<{ n: number }> = () => {
  const { data, isLoading } = useApiData(URL, { suspense: false });
  const send = useApi('get', url`/test/${'id'}`);

  console.log('new render');
  useEffect(() => console.log('new send'), [send]);

  return (
    <>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </>
  );
};
