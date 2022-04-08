import { act, renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';

import { SwrCache, SwrCacheContext } from '../../../old/cache';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('SwrCache', () => {
  // Tests
  it('should update cache', () => {
    // Render
    const { result } = renderHook(() => useContext(SwrCacheContext), { wrapper: SwrCache });

    // Checks
    expect(result.current.cache).toBeDefined();
    expect(result.current.setCache).toBeDefined();

    // Change value
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    act(() => result.current.setCache!('test', true));
    expect(result.current.cache?.test?.data).toBe(true);

    // Change value again
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    act(() => result.current.setCache!('test', 85));
    expect(result.current.cache?.test?.data).toBe(85);
  });
});
