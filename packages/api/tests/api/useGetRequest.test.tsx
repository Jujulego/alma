import { FC } from 'react';
import { AxiosResponse, CancelTokenSource } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { SwrCacheContext, useGetRequest } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useGetRequest', () => {
  // Tests
  it('should return api call result', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
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
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return api call error', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
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

    // Checks
    expect(result.current).toEqual({
      loading: true,
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 400,
      error: 'Bad Request',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should use cached data first', async () => {
    // Render
    const spyCache = jest.fn<void, [string, string]>();
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const wrapper: FC = ({ children }) => (
      <SwrCacheContext.Provider value={{
        cache: { 'test-id': { data: 'cached' } },
        setCache: spyCache
      }}>
        { children }
      </SwrCacheContext.Provider>
    );

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id'), { wrapper });

    // Checks
    expect(result.current).toEqual({
      loading: true,
      data: 'cached',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyCache).toHaveBeenCalledWith('test-id', 'test');
  });

  it('should not run api call', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result } = renderHook(() => useGetRequest(spy, 'test-id', false));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should run another api call on reload', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
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
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After reload
    act(() => result.current.reload());
    expect(result.current).toEqual({
      loading: true,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should update state value', async () => {
    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
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
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After update (simple value)
    act(() => result.current.update('it\'s'));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s' }));

    // After update (updator)
    act(() => result.current.update((old) => `${old} working`));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s working' }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});