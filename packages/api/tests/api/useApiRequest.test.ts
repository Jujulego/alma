import axios from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { useApiRequest } from '../../src/api';
import { ApiPromise } from '../../src/api-promise';
import { ApiResponse } from '../../src/types';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useApiRequest', () => {
  // Tests
  it('should call request generator on send call', async () => {
    // Mocks
    let response: (data: string) => void = () => undefined;

    jest.spyOn(axios, 'request').mockReturnValue(new Promise((resolve) => {
      response = (data) => resolve({
        status: 200,
        headers: {
          TEST: 'test'
        },
        data
      });
    }));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>());

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/test',
      headers: {
        TEST: 'test',
      },
      signal: expect.any(AbortSignal)
    });

    // After receive
    await act(async () => {
      response('success');

      await expect(prom).resolves.toEqual({
        status: 200,
        headers: {
          TEST: 'test',
        },
        data: 'success'
      });
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should reset loading if request failed', async () => {
    // Mocks
    let response: (error: unknown) => void = () => undefined;
    jest.spyOn(axios, 'request').mockReturnValue(new Promise((resolve, reject) => {
      response = (error) => reject(error);
    }));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>());

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(axios.request).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      response(new Error('Request failed'));

      await expect(prom).rejects.toEqual(new Error('Request failed'));
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should abort request on request cancel', async () => {
    // Mocks
    jest.spyOn(axios, 'request').mockReturnValue(new Promise(() => undefined));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>());

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(axios.request).toHaveBeenCalledTimes(1);

    // Abort !
    act(() => {
      prom.cancel();
    });

    const { signal } = (axios.request as jest.MockedFunction<typeof axios.request>).mock.calls[0][0];
    expect(signal?.aborted).toBe(true);
  });
});
