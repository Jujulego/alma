import { $graphql, gql } from '@jujulego/alma-graphql';
import { FC, useCallback, useTransition } from 'react';

// Constants
const useRepoIssues = $graphql(gql<{ repo: string, owner: string }>`query RepoIssues($repo: String!, $owner: String!) {
    repository(owner: $owner, name: $repo) {
        issues(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
            totalCount
            nodes {
                author {
                    login
                }
                title
                bodyText
            }
        }
    }
}`, {
  url: 'https://api.github.com/graphql',
  headers: {
    'Authorization': 'Bearer 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'
  }
});

useRepoIssues.prefetch({ owner: 'microsoft', repo: 'typescript' });

// Component
export const GqlData: FC<{ n: number }> = () => {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading, refresh } = useRepoIssues({ owner: 'microsoft', repo: 'typescript' });

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
