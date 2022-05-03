import { globalWarehouse } from '@jujulego/alma-resources';
import { act, renderHook } from '@testing-library/react-hooks';

import { $api, $url, almaApiConfig, ApiFetcher } from '../src';

// Setup
let resolve: () => void;
let fetcher: ApiFetcher;

beforeEach(() => {
  fetcher = jest.fn().mockImplementation(() => new Promise((res) => {
    resolve = () => res({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: 'success'
    });
  }));

  almaApiConfig({ fetcher });
});

afterEach(() => {
  globalWarehouse().clear();
});

// Modes
describe('Effect mode', () => {
  // Tests
  it('should return a hook witch sends a get request', async () => {
    // Render
    const useApiData = $api('get', '/test', { suspense: false });

    const { result, waitForNextUpdate } = renderHook(() => useApiData());

    // Initially should be "loading"
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      {
        method: 'get',
        url: '/test',
        query: {},
        headers: {},
        responseType: 'json'
      },
      expect.any(AbortSignal)
    );

    // After response is received
    act(() => resolve());
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should send a get request to built url', async () => {
    // Render
    const useApiData = $api('get', $url`/test/${'id'}`, { suspense: false });

    const { waitForNextUpdate } = renderHook((props) => useApiData(props), {
      initialProps: { id: 5 },
    });

    // Trigger response
    act(() => resolve());
    await waitForNextUpdate();

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test/5' }),
      expect.any(AbortSignal)
    );

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous request when url changes', async () => {
    // Render
    const useApiData = $api('get', $url`/test/${'id'}`, { suspense: false });

    const { rerender, waitForNextUpdate } = renderHook((props) => useApiData(props), {
      initialProps: { id: 5 },
    });

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test/5' }),
      expect.any(AbortSignal)
    );

    // Change ids
    rerender({ id: 10 });

    // After response is received
    act(() => resolve());
    await waitForNextUpdate();

    // Should have called fetcher with updated url
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test/10' }),
      expect.any(AbortSignal)
    );

    // Initial request should have been aborted
    expect(jest.mocked(fetcher).mock.calls[0][1].aborted).toBe(true);
  });

  it('should send a new request when calling refresh if previous ended', async () => {
    // Render
    const useApiData = $api('get', '/test', { suspense: false });

    const { result, waitForNextUpdate } = renderHook(() => useApiData());

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(AbortSignal)
    );

    // Trigger refresh
    act(() => {
      result.current.refresh();
    });

    // Trigger response
    act(() => resolve());
    await waitForNextUpdate();

    // Trigger refresh
    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe('success');

    // Fetcher should have been called twice
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should send request before hook is called by using prefetch', async () => {
    // Render
    const useApiData = $api('get', '/test', { suspense: false });

    // Prefetch
    useApiData.prefetch();
    resolve();

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(AbortSignal)
    );

    // Result already loaded
    const { result, waitForNextUpdate } = renderHook(() => useApiData());
    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');

    // Fetcher should have been called twice
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('Suspense mode', () => {
  // Tests
  it('should return a hook witch sends a get request', async () => {
    // Render
    const useApiData = $api('get', '/test');

    const { result, rerender } = renderHook(() => useApiData());

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      {
        method: 'get',
        url: '/test',
        query: {},
        headers: {},
        responseType: 'json'
      },
      expect.any(AbortSignal)
    );

    // Emulates Suspense
    resolve();
    await new Promise((res) => setTimeout(res, 0));
    rerender();

    // After response is received
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should send a get request to built url', async () => {
    // Render
    const useApiData = $api('get', $url`/test/${'id'}`);

    const { result, rerender } = renderHook(() => useApiData({ id: 5 }));

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test/5' }),
      expect.any(AbortSignal)
    );

    // Trigger response
    resolve();
    await new Promise((res) => setTimeout(res, 0));
    rerender();

    // After response is received
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should send a new request when calling refresh', async () => {
    // Render
    const useApiData = $api('get', '/test');

    const { rerender, result } = renderHook(() => useApiData());

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(AbortSignal)
    );

    // Trigger response
    resolve();
    await act(() => new Promise((res) => setTimeout(res, 0)));
    rerender();

    // Trigger refresh
    act(() => {
      result.current.refresh();
    });

    // Fetcher should have been called twice
    expect(fetcher).toHaveBeenCalledTimes(2);

    // Trigger response
    resolve();
    await act(() => new Promise((res) => setTimeout(res, 0)));
    rerender();
  });

  it('should send request before hook is called by using prefetch', async () => {
    // Render
    const useApiData = $api('get', '/test');

    // Prefetch
    useApiData.prefetch();

    resolve();
    await new Promise((res) => setTimeout(res, 0));

    // Should have called fetcher with given request
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(AbortSignal)
    );

    // Result already loaded
    const { result } = renderHook(() => useApiData());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('success');

    // Fetcher should have been called twice
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
