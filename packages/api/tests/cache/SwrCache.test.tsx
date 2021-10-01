import { FC } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import { SwrCache, useSwrCache } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('SwrCache', () => {
  // Tests
  it('should update cache', () => {
    const wrapper: FC = ({ children }) => (
      <SwrCache>{children}</SwrCache>
    );

    const { result } = renderHook(() => useSwrCache<string>('test'), { wrapper });

    // Checks
    expect(result.current.data).toBeUndefined();

    // Change value
    act(() => result.current.setCache('data'));
    expect(result.current.data).toBe('data');
  });
});