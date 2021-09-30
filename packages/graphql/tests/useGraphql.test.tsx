import { renderHook } from '@testing-library/react-hooks';
import gql from 'graphql-tag';

import { useGraphql } from '../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('useGraphql', () => {
  it('should work !', async () => {
    // Render
    const { result, waitForNextUpdate } = renderHook(() => useGraphql<any>('https://api.github.com/graphql', gql`
        query ListRepository {
            repository(owner:"octocat", name:"Hello-World") {
                issues(last:20, states:CLOSED) {
                    edges {
                        node {
                            title
                            url
                            labels(first:5) {
                                edges {
                                    node {
                                        name
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `, { headers: { AUTHORIZATION: 'Bearer ' }}));

    // Checks
    await waitForNextUpdate();
    expect(result.current).toBe({});
  });
});