import { renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';

import { AlmaApiSetup, ApiConfigContext, ApiFetcher, fetcher as defaultFetcher, SwrCacheContext } from '../../old';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('AlmaApiSetup', () => {
  it('should only setup config with default fetcher', () => {
    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual({
      fetcher: defaultFetcher
    });

    // Check cache
    const { result: cacheResult } = renderHook(() => useContext(SwrCacheContext), {
      wrapper: ({ children }) => <AlmaApiSetup>{ children }</AlmaApiSetup>,
    });

    expect(cacheResult.current).toEqual({});
  });

  it('should only setup config with given fetcher', () => {
    const fetcher: ApiFetcher = jest.fn();

    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup fetcher={fetcher}>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual({
      fetcher
    });

    // Check cache
    const { result: cacheResult } = renderHook(() => useContext(SwrCacheContext), {
      wrapper: ({ children }) => <AlmaApiSetup fetcher={fetcher}>{ children }</AlmaApiSetup>,
    });

    expect(cacheResult.current).toEqual({});
  });

  it('should setup config and cache', () => {
    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup globalCache>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual({
      fetcher: defaultFetcher
    });

    // Check cache
    const { result: cacheResult } = renderHook(() => useContext(SwrCacheContext), {
      wrapper: ({ children }) => <AlmaApiSetup globalCache>{ children }</AlmaApiSetup>,
    });

    expect(cacheResult.current).toEqual({
      cache: expect.any(Object),
      setCache: expect.any(Function),
    });
  });
});
