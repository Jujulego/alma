import { act, renderHook } from '@testing-library/react-hooks';
import { AxiosResponse } from 'axios';
import { useState } from 'react';

import { useGetRequest } from '../../src/api/useGetRequest';
import { ApiPromise } from '../../src/api-promise';
import { useSwrCache as _useSwrCache } from '../../src/cache/useSwrCache';
import { ApiResult} from '../../src/types';
import { Updator } from '../../src/utils';

// Mocks
jest.mock('../../src/cache/useSwrCache');
const useSwrCache = _useSwrCache as jest.MockedFunction<typeof _useSwrCache>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useSwrCache.mockImplementation(() => {
    const [data, setData] = useState({ status: 0 });
    return { data, setData };
  });
});

// Test suites
describe('useGetRequest', () => {
  // Tests
  it('should return api call result', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'));

    // Checks
    expect(result.current).toEqual({
      loading: true,
      status: 0,
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(useSwrCache).toHaveBeenCalledWith('test-id', { status: 0 }, false);

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return api call error', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: 'Bad Request',
          headers: {},
          config: {}
        }
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 400,
      error: 'Bad Request',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return cached data first', async () => {
    // Mocks
    const spyCache = jest.fn<void, [string]>();

    useSwrCache.mockReturnValue({
      data: { status: 200, data: 'cached' },
      setData: spyCache,
    });

    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'));

    // Checks
    expect(result.current).toEqual({
      loading: true,
      status: 200,
      data: 'cached',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    await waitForNextUpdate();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not run api call', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result } = renderHook(() => useGetRequest(spy, 'test-id', undefined, { load: false }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      status: 0,
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should run another api call on reload', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'));

    // Checks
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After reload
    act(() => result.current.reload());
    expect(result.current).toEqual({
      loading: true,
      status: 200,
      data: 'test',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should run api call on send', async () => {
    // Render
    let resolve: (data: string) => void;
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockReturnValue(new Promise<AxiosResponse<string>>((res) => {
        resolve = (data) => res({
          status: 200,
          statusText: 'OK',
          data,
          headers: {},
          config: {}
        });
      }));

    const { result } = renderHook(() => useGetRequest(spy, 'test-id', undefined, { load: false }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      status: 0,
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After send
    let prom: ApiPromise<ApiResult<string>>;
    act(() => {
      prom = result.current.send({ test: 'a' });
    });

    expect(result.current).toEqual({
      loading: true,
      status: 0,
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await act(async () => {
      resolve('test');
      await expect(prom).resolves.toEqual({ status: 200, data: 'test' });
    });

    expect(result.current).toEqual({
      loading: false,
      status: 0,
      send: expect.any(Function),
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should update state data value', async () => {
    // Mocks
    const spyCache = jest.fn<void, [string]>();

    useSwrCache.mockReturnValue({
      data: undefined,
      setData: spyCache,
    });

    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [AbortSignal]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'));
    await waitForNextUpdate();

    // Checks
    spyCache.mockReset();

    act(() => result.current.update('updated'));
    expect(spyCache).toHaveBeenCalledWith(expect.any(Function));

    const updator = spyCache.mock.calls[0][0] as unknown as Updator<ApiResult<string>>;

    // Check data update cases
    expect(updator({ status: 200, data: 'test' })).toEqual({ status: 200, data: 'updated' });
    expect(updator({ status: 0 })).toEqual({ status: 0, data: 'updated' });
    expect(updator({ status: 400, error: 'failed' })).toEqual({ status: 400, data: 'updated' });

    expect(spy).toHaveBeenCalledTimes(1);
  });
});