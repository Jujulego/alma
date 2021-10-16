import { act, renderHook } from '@testing-library/react-hooks';
import { FC } from 'react';

import { SwrCacheContext, useSwrCache } from '../../src/cache';
import { Updator } from '../../src/types';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test Suites
describe('useSwrCache', () => {
  // Tests
  it('should return cached value', () => {
    // Render
    const wrapper: FC<{ value: number }> = ({ value, children }) => (
      <SwrCacheContext.Provider
        value={{
          cache: {
            test: { data: value }
          },
          setCache: jest.fn(),
        }}
      >
        { children }
      </SwrCacheContext.Provider>
    );

    const { result, rerender } = renderHook(() => useSwrCache('test', 0), {
      wrapper,
      initialProps: { value: 1 }
    });

    // Checks
    expect(result.current.data).toBe(1);

    // Change value in cache
    rerender({ value: 2 });

    expect(result.current.data).toBe(2);
  });

  it('should update cached value', () => {
    // Render
    const setCache = jest.fn<void, [unknown | Updator]>();
    const wrapper: FC = ({ children }) => (
      <SwrCacheContext.Provider
        value={{
          cache: {},
          setCache,
        }}
      >
        { children }
      </SwrCacheContext.Provider>
    );

    const { result } = renderHook(() => useSwrCache('test', 0), { wrapper });

    // Checks
    expect(result.current.data).toBe(0);

    // Set cache data
    act(() => {
      result.current.setData(1);
    });

    expect(setCache).toHaveBeenCalledWith('test', 1);
  });

  it('should return and update local value', () => {
    // Render
    const { result } = renderHook(() => useSwrCache('test', 0));

    // Checks
    expect(result.current.data).toBe(0);

    // Change value
    act(() => {
      result.current.setData(1);
    });

    expect(result.current.data).toBe(1);
  });

  it('should ignore cache', () => {
    // Render
    const setCache = jest.fn<void, [unknown | Updator]>();
    const wrapper: FC = ({ children }) => (
      <SwrCacheContext.Provider
        value={{
          cache: {
            test: { data: 1 }
          },
          setCache,
        }}
      >
        { children }
      </SwrCacheContext.Provider>
    );

    const { result } = renderHook(() => useSwrCache('test', 0, true), { wrapper });

    // Checks
    expect(result.current.data).toBe(0);

    // Set cache data
    act(() => {
      result.current.setData(2);
    });

    expect(setCache).not.toHaveBeenCalled();
    expect(result.current.data).toBe(2);
  });
});
