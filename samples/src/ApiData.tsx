import { useApiData } from '@jujulego/alma-api';
import { FC } from 'react';

// Constants
const URL = 'https://datausa.io/api/data?drilldowns=Nation&measures=Population';

// Component
export const ApiData: FC = () => {
  const { data } = useApiData(URL);

  return (
    <code style={{ whiteSpace: 'pre-wrap' }}>
      { JSON.stringify(data, null, 2) }
    </code>
  );
};
