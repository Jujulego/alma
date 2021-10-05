import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import gql from 'graphql-tag';

import { gqlResource } from '../src';
import { TestData } from './types';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('apiResource', () => {
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
  it('should send document with variables to given url and return results', async () => {
    // Render
    const useGqlTest = gqlResource<TestData, { name: string }>('/graphql', gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `);
    const { result, waitForNextUpdate } = renderHook(() => useGqlTest({ name: 'name' }));

    // Check
    expect(result.current).toEqual({
      data: undefined,
      error: undefined,
      loading: true,
      reload: expect.any(Function),
      update: expect.any(Function),
    });

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

    // Check axios call
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      '/graphql',
      {
        operationName: 'Test',
        query: expect.any(String),
        variables: { name: 'name' }
      },
      {
        cancelToken: expect.any(axios.CancelToken),
      }
    );
  });

  it('should send document with variables to given url and return error', async () => {
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
    const useGqlTest = gqlResource<TestData, { name: string }>('/graphql', gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `);
    const { result, waitForNextUpdate } = renderHook(() => useGqlTest({ name: 'name' }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({
      data: undefined,
      error: expect.objectContaining({
        errors: [
          {
            message: 'error in test',
            location: {
              column: 1, line: 1
            }
          }
        ]
      })
    }));

    // Check axios call
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should update state value', async () => {
    // Render
    const useGqlTest = gqlResource<{ test: TestData }, { name: string }>('/graphql', gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `);
    const { result, waitForNextUpdate } = renderHook(() => useGqlTest({ name: 'name' }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({
      data: {
        test: {
          isSuccessful: true
        }
      },
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
    act(() => result.current.update((old) => ({
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

    // Check axios call
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});