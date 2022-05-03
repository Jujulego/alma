import { act, renderHook } from '@testing-library/react-hooks';

import { $api, almaApiConfig, ApiFetcher } from '../src';

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
});
