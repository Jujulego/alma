import { act, renderHook } from '@testing-library/react-hooks';
import { FC, useContext } from 'react';

import { SwrCache, SwrCacheContext } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('SwrCache', () => {
  // Tests
  it('should update cache', () => {
    // Render
    const wrapper: FC = ({ children }) => (
      <SwrCache>{ children }</SwrCache>
    );

    const { result } = renderHook(() => useContext(SwrCacheContext), { wrapper });

    // Checks
    expect(result.current.cache).toBeDefined();
    expect(result.current.setCache).toBeDefined();

    // Change value
    act(() => result.current.setCache!('test', true));
    expect(result.current.cache?.test?.data).toBe(true);

    // Change value again
    act(() => result.current.setCache!('test', 85));
    expect(result.current.cache?.test?.data).toBe(85);
  });
});