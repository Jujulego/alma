import { renderHook, act } from '@testing-library/react-hooks';

import { useInterval } from '../src';

// Test suite
describe('useInterval', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  // Tests
  it('should return previous value', () => {
    // Render
    const { result } = renderHook(() => useInterval(1000));

    // Checks
    expect(result.current).toBe(0);

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);
  });
});