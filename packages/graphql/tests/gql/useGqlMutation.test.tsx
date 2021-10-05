import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import gql from 'graphql-tag';

import { useGqlMutation } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('useGqlMutation', () => {
  beforeEach(() => {
    // Mocks
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          test: {
            isSuccessful: true
          }
        }
      }
    });
  });

  // Tests
  it('should return mutation result', async () => {
    // Render
    const req = gql`
        mutation Test($test: String!) {
            success(name: $test) {
                isSuccessful
            }
        }
    `;

    const { result } = renderHook(() => useGqlMutation<unknown, { name: string }>('/graphql', req));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ loading: false }));

    // After send
    await act(async () => {
      await expect(result.current.send({ name: 'test' }))
        .resolves.toEqual({
          test: {
            isSuccessful: true
          }
        });
    });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/graphql',
      {
        operationName: 'Test',
        query: expect.any(String),
        variables: {
          name: 'test'
        }
      },
      {
        cancelToken: expect.any(axios.CancelToken),
      }
    );
  });
});