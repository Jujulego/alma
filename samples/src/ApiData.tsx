import { useApiData } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const URL = 'https://datausa.io/api/data?drilldowns=Nation&measures=Population';

// Component
export const ApiData: FC = () => {
  const { data, isLoading } = useApiData(URL, { suspense: false });

  console.log('render !', isLoading);

  return (
    <div>
      <p>Status: <strong>{ isLoading ? 'loading ...' : 'done' }</strong></p>
      <code style={{ whiteSpace: 'pre-wrap' }}>
        { JSON.stringify(data, null, 2) }
      </code>
    </div>
  );
};
