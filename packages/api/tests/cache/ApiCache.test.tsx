import { FC } from 'react';
import { act, renderHook } from '@testing-library/react-hooks';

import { ApiCache, useCache } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('ApiCache', () => {
  // Tests
  it('should update cache', () => {
    const wrapper: FC = ({ children }) => (
      <ApiCache>{children}</ApiCache>
    );

    const { result } = renderHook(() => useCache<string>('test'), { wrapper });

    // Checks
    expect(result.current.data).toBeUndefined();

    // Change value
    act(() => result.current.setCache('data'));
    expect(result.current.data).toBe('data');
  });
});