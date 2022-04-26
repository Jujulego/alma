import { $api, $get, $url } from '@jujulego/alma-api';
import { FC, useCallback, useTransition } from 'react';

// Constants
const useUSAPopulation = $api($get(), $url`https://api.github.com/repos/${'owner'}/${'repo'}/issues`, {
  query: {
    sort: 'created', direction: 'desc'
  },
  responseType: 'arraybuffer',
  suspense: true,
});

useUSAPopulation.prefetch({ owner: 'microsoft', repo: 'typescript' });

// Component
export const ApiData: FC<{ n: number }> = () => {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, refresh } = useUSAPopulation({ owner: 'microsoft', repo: 'typescript' });

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
