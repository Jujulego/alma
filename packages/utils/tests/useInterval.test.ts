import { renderHook, act } from '@testing-library/react-hooks';

import { useInterval } from '../src';

// Test suite
describe('useInterval', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
  });

  // Tests
  it('should return new value each seconds', () => {
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
  
  it('should return call spy each seconds', () => {
    // Render
    const spy = jest.fn();
    const { result } = renderHook(() => useInterval(1000, spy));

    // Checks
    expect(result.current).toBe(0);
    expect(spy).toHaveBeenCalledTimes(0);

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(1);
    expect(spy).toHaveBeenCalledTimes(1);

    // Advance by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(2);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
