import { act, renderHook } from '@testing-library/react-hooks';
import { useState } from 'react';

import {
  ApiResponse,
  ApiPromise,
  makeApiPromise,
  useApiAutoLoad,
  useApiGet as _useApiGet,
  useSwrCache as _useSwrCache
} from '../../src';

// Mocks
jest.mock('../../src/api/useApiGet');
const useApiGet = _useApiGet as jest.MockedFunction<typeof _useApiGet>;

jest.mock('../../src/cache/useSwrCache');
const useSwrCache = _useSwrCache as jest.MockedFunction<typeof _useSwrCache>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useApiGet.mockReturnValue({
    loading: false,
    send: jest.fn()
  });

  useSwrCache.mockImplementation((id, initial) => {
    const [data, setData] = useState(initial);
    return { data, setData };
  });
});

// Test suites
describe('useApiAutoLoad', () => {
  // Tests
  it('should send api request and return result', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, []>()
      .mockResolvedValue({
        status: 200,
        data: 'success',
        headers: {}
      });

    useApiGet.mockReturnValue({ loading: true, send: spySend });

    const spySetData = jest.fn<void, [string | undefined]>();

    useSwrCache.mockImplementation((id, initial) => {
      const [data, setData] = useState(initial);
      spySetData.mockImplementation(setData);

      return { data, setData: spySetData };
    });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useApiAutoLoad<string>(useApiGet, '/api/test'));

    expect(useSwrCache).toHaveBeenCalledWith('api:/api/test', undefined, false);
    expect(useApiGet).toHaveBeenCalledWith('/api/test', undefined);
    expect(result.current).toEqual({
      loading: true,
      reload: expect.any(Function),
      setData: expect.any(Function),
    });

    expect(spySend).toHaveBeenCalledTimes(1);

    // After receive
    await waitForNextUpdate();

    expect(spySetData).toHaveBeenCalledWith('success');
    expect(spySend).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(expect.objectContaining({
      data: 'success',
    }));
  });

  it('should send api request and return error', async () => {
    // Mocks
    const error = new Error();
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, []>()
      .mockRejectedValue(error);

    useApiGet.mockReturnValue({ loading: true, send: spySend });

    const spySetData = jest.fn<void, [string | undefined]>();

    useSwrCache.mockImplementation((id, initial) => {
      const [data, setData] = useState(initial);
      spySetData.mockImplementation(setData);

      return { data, setData: spySetData };
    });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useApiAutoLoad<string>(useApiGet, '/api/test'));

    expect(useSwrCache).toHaveBeenCalledWith('api:/api/test', undefined, false);
    expect(useApiGet).toHaveBeenCalledWith('/api/test', undefined);
    expect(result.current).toEqual({
      loading: true,
      reload: expect.any(Function),
      setData: expect.any(Function),
    });

    expect(spySend).toHaveBeenCalledTimes(1);

    // After receive
    await waitForNextUpdate();

    expect(spySetData).not.toHaveBeenCalled();
    expect(spySend).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(expect.objectContaining({
      error,
    }));
  });

  it('should not send api request', () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<string>>, []>();
    useApiGet.mockReturnValue({
      loading: true,
      send: spy
    });

    // Render
    renderHook(() => useApiAutoLoad<string>(useApiGet, '/api/test', { load: false }));

    expect(spy).not.toHaveBeenCalled();
  });

  it('should re-send api request', () => {
    // Mocks
    const spyCancel = jest.fn();
    const spy = jest.fn<ApiPromise<ApiResponse<string>>, []>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), spyCancel));

    useApiGet.mockReturnValue({
      loading: true,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useApiAutoLoad<string>(useApiGet, '/api/test'));

    // After receive
    expect(spy).toHaveBeenCalledTimes(1);

    // Request reload
    act(() => result.current.reload());

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spyCancel).toHaveBeenCalledTimes(1);
  });
});
