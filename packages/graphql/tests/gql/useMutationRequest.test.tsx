import { ApiPromise, ApiResult } from '@jujulego/alma-api';
import * as almaApi from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useMutationRequest } from '../../src/gql/useMutationRequest';
import { GqlResponse } from '../../src/types';
import { TestData } from '../types';

// Mocks
jest.mock('@jujulego/alma-api');
const { usePostRequest } = almaApi as jest.Mocked<typeof almaApi>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useMutationRequest', () => {
  // Tests
  it('should send request using axios post and usePostRequest', async () => {
    // Mocks
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        test: { isSuccessful: true }
      }
    });

    usePostRequest.mockReturnValue({
      loading: true,
      send: jest.fn(),
    });

    // Render
    renderHook(() => useMutationRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'mutation',
      operationName: 'Test'
    }));

    // Check useGetRequest call
    expect(usePostRequest).toHaveBeenCalledWith(expect.any(Function));

    // Check generator
    const generator = usePostRequest.mock.calls[0][0];
    const abort = new AbortController();

    await expect(generator({ name: 'name' }, abort.signal))
      .resolves.toEqual({
        data: {
          test: { isSuccessful: true }
        }
      });

    expect(axios.post).toHaveBeenCalledWith('/graphql', {
      query: 'mutation',
      operationName: 'Test',
      variables: { name: 'name' }
    }, { signal: abort.signal });
  });

  it('should call usePostRequest and return it\'s state', () => {
    // Mocks
    usePostRequest.mockReturnValue({
      loading: true,
      send: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useMutationRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }));

    // Checks
    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });
  });

  it('should return api call result', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResult<GqlResponse<{ test: TestData }>>>, [{ name: string }]>()
      .mockResolvedValue({
        status: 200,
        data: {
          data: { test: { isSuccessful: true } }
        }
      });

    usePostRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useMutationRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    await act(async () => {
      await expect(result.current.send({ name: 'name' }))
        .resolves.toEqual({
          test: { isSuccessful: true }
        });
    });

    expect(spy).toHaveBeenCalledWith({ name: 'name' });
  });
});