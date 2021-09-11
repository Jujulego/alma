import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useAPI } from '../src/useApi';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useApi.get', () => {
  // Tests
  it('should return api call result', async () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useAPI.get<string>('/api/test'));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken)
    });
  });

  it('should reload data', async () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useAPI.get<string>('/api/test'));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    // After reload
    act(() => {
      result.current.reload();
    });

    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('should not load api call', () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' });

    // Render
    const { result } = renderHook(() => useAPI.get<string>('/api/test', {}, { load: false }));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

    expect(axios.get).not.toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken)
    });
  });

  it('should update cached value', async () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useAPI.get<string>('/api/test'));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    // Update cached value
    act(() => {
      result.current.update('it\'s');
    });

    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s', loading: false }));

    // Update cached value (with updator)
    act(() => {
      result.current.update((old) => `${old} working`);
    });

    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s working', loading: false }));
  });
});
