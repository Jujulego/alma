import { AxiosResponse, CancelTokenSource } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { useGetRequest } from '../src';

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
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

    // After receive
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    expect(spy).toHaveBeenCalledTimes(1);
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
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));
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
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    // After reload
    act(() => result.current.reload());
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: true }));
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

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
    expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));
    await waitForNextUpdate();
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    // After update (simple value)
    act(() => result.current.update('it\'s'));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s', loading: false }));

    // After update (updator)
    act(() => result.current.update((old) => `${old} working`));
    expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s working', loading: false }));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});