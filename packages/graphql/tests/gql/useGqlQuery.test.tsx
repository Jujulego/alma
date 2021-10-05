import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import gql from 'graphql-tag';

import { useGqlQuery } from '../../src';
import { TestData } from '../types';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('useGqlQuery', () => {
  beforeEach(() => {
    // Mocks
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        data: {
          test: {
            isSuccessful: true
          }
        },
        errors: [
          {
            message: 'error in test',
            location: {
              column: 1, line: 1
            }
          }
        ]
      }
    });
  });

  // Tests
  it('should return query result', async () => {
    // Render
    const req = gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `;

    const { result, waitForNextUpdate } = renderHook(() => useGqlQuery<{ test: TestData }>('/graphql', req, {}));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, error: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({
      data: {
        test: {
          isSuccessful: true
        }
      },
      error: expect.objectContaining({
        errors: [
          {
            message: 'error in test',
            location: {
              column: 1, line: 1
            }
          }
        ]
      }),
      loading: false
    }));

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/graphql',
      {
        operationName: 'Test',
        query: expect.any(String),
        variables: {}
      },
      {
        cancelToken: expect.any(axios.CancelToken),
      }
    );
  });

  it('should return query error', async () => {
    // Mocks
    jest.spyOn(axios, 'post').mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        statusText: 'Bad Request',
        data: {
          errors: [
            {
              message: 'error in test',
              location: {
                column: 1, line: 1
              }
            }
          ]
        },
        headers: {},
        config: {}
      }
    });

    // Render
    const req = gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `;

    const { result, waitForNextUpdate } = renderHook(() => useGqlQuery<{ test: TestData }>('/graphql', req, {}));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, error: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({
      data: undefined,
      error: {
        errors: [
          {
            message: 'error in test',
            location: {
              column: 1, line: 1
            }
          }
        ]
      },
      loading: false
    }));

    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should update state value', async () => {
    // Render
    const req = gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `;

    const { result, waitForNextUpdate } = renderHook(() => useGqlQuery<{ test: TestData }>('/graphql', req, {}));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({
      data: {
        test: {
          isSuccessful: true
        }
      }
    }));

    // After update (simple value)
    act(() => result.current.update({
      test: {
        isSuccessful: false
      }
    }));
    expect(result.current).toEqual(expect.objectContaining({
      data: {
        test: {
          isSuccessful: false
        }
      }
    }));

    // After update (updator)
    act(() => result.current.update((old: any) => ({
      test: {
        isSuccessful: !old?.test?.isSuccessful
      }
    })));
    expect(result.current).toEqual(expect.objectContaining({
      data: {
        test: {
          isSuccessful: true
        }
      }
    }));

    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});