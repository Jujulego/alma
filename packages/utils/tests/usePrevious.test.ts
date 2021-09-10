import { renderHook } from '@testing-library/react-hooks';

import { usePrevious } from '../src';

// Tests
describe('usePrevious', () => {
  it('should return previous value', () => {
    // Render
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 }
    });

    // Checks
    expect(result.current).toBeNull();

    // Update prop
    rerender({ value: 2 });
    expect(result.current).toBe(1);

    // Update prop
    rerender({ value: 5 });
    expect(result.current).toBe(2);
  });
});