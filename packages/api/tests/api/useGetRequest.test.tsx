import { AxiosResponse, CancelTokenSource } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { useGetRequest, useSwrCache as _useSwrCache } from '../../src';

// Mocks
jest.mock('../../src/cache/SwrCacheContext');
const useSwrCache = _useSwrCache as jest.MockedFunction<typeof _useSwrCache>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useSwrCache.mockReturnValue({
    data: undefined,
    setCache: jest.fn(),
  });
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
      cached: false,
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(useSwrCache).toHaveBeenCalledWith('test-id');

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      cached: false,
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

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      cached: false,
      status: 400,
      error: 'Bad Request',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should return cached data first', async () => {
    // Mocks
    const spyCache = jest.fn<void, [string]>();

    useSwrCache.mockReturnValue({
      data: 'cached',
      setCache: spyCache,
    });

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
      cached: true,
      data: 'cached',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyCache).toHaveBeenCalledWith('test');
  });

  it('should not use cached data', async () => {
    // Mocks
    const spyCache = jest.fn<void, [string]>();

    useSwrCache.mockReturnValue({
      data: 'cached',
      setCache: spyCache,
    });

    // Render
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockResolvedValue({
        status: 200,
        statusText: 'OK',
        data: 'test',
        headers: {},
        config: {}
      });

    const { result, waitForNextUpdate } = renderHook(() => useGetRequest(spy, 'test-id', { disableSwr: true }));

    // Checks
    expect(result.current).toEqual({
      loading: true,
      cached: false,
      data: undefined,
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spyCache).not.toHaveBeenCalled();
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

    const { result } = renderHook(() => useGetRequest(spy, 'test-id', { load: false }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      cached: false,
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
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After reload
    act(() => result.current.reload());
    expect(result.current).toEqual({
      loading: true,
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    await waitForNextUpdate();
    expect(result.current).toEqual({
      loading: false,
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should update state value', async () => {
    // Mocks
    const spyCache = jest.fn<void, [string]>();

    useSwrCache.mockReturnValue({
      data: undefined,
      setCache: spyCache,
    });

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
      cached: false,
      status: 200,
      data: 'test',
      reload: expect.any(Function),
      update: expect.any(Function)
    });

    // After update (simple value)
    act(() => result.current.update('it\'s'));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s' }));
    expect(spyCache).toHaveBeenCalledWith('it\'s');

    // After update (updator)
    act(() => result.current.update((old) => `${old} working`));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s working' }));
    expect(spyCache).toHaveBeenCalledWith('it\'s working');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});