import { AxiosResponse } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { usePostRequest } from '../../src/api/usePostRequest';
import { ApiPromise } from '../../src/api-promise';
import { ApiResult } from '../../src/types';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('usePostRequest', () => {
  // Tests
  it('should return api call result', async () => {
    // Render
    let resolve: (data: string) => void;
    const spy = jest.fn<Promise<AxiosResponse<string>>, [string, AbortSignal]>()
      .mockReturnValue(new Promise<AxiosResponse<string>>((res) => {
        resolve = (data) => res({
          status: 200,
          statusText: 'OK',
          data,
          headers: {},
          config: {}
        });
      }));

    const { result } = renderHook(() => usePostRequest(spy));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // After send
    let prom: ApiPromise<ApiResult<string>>;
    act(() => {
      prom = result.current.send('body');
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('body', expect.any(AbortSignal), undefined);

    // After receive
    await act(async () => {
      resolve('test');
      await expect(prom).resolves.toEqual({ status: 200, data: 'test' });
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should return api call error', async () => {
    // Render
    let reject: () => void;
    const spy = jest.fn<Promise<AxiosResponse<string>>, [string, AbortSignal]>()
      .mockReturnValue(new Promise<AxiosResponse<string>>((_, rej) => {
        reject = () => rej({
          isAxiosError: true,
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: 'Bad Request',
            headers: {},
            config: {}
          }
        });
      }));

    const { result } = renderHook(() => usePostRequest(spy));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // After send
    let prom: ApiPromise<ApiResult<string>>;
    act(() => {
      prom = result.current.send('body');
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      reject();
      await expect(prom).rejects.toEqual({
        status: 400,
        error: 'Bad Request',
      });
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should cancel api call result', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [string, AbortSignal]>()
      .mockReturnValue( new Promise<AxiosResponse<string>>(() => undefined));

    const { result } = renderHook(() => usePostRequest(spy));

    // Checks
    let prom: ApiPromise<ApiResult<string>>;
    act(() => {
      prom = result.current.send('body');
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // Cancel
    act(() => {
      prom.cancel();
    });

    const abort = spy.mock.calls[0][1];
    expect(abort.aborted).toBe(true);
  });
});