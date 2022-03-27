import { act, renderHook } from '@testing-library/react-hooks';

import { useAsync } from '../src';

// Tests
describe('useAsync', () => {
  it('should return resolved value', async () => {
    let resolve: (val: string) => void;
    const promise = new Promise<string>((res) => {
      resolve = res;
    });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useAsync(promise, 'initial'));

    // Checks
    expect(result.current).toBe('initial');

    // Resolve promise
    act(() => {
      resolve('resolved');
    });
    await waitForNextUpdate();

    expect(result.current).toBe('resolved');
  });

  it('should ignore first promise', async () => {
    let resolve1: (val: string) => void;
    const promise1 = new Promise<string>((res) => {
      resolve1 = res;
    });

    let resolve2: (val: string) => void;
    const promise2 = new Promise<string>((res) => {
      resolve2 = res;
    });

    // Render
    const { result, rerender, waitForNextUpdate } = renderHook(({ promise }) => useAsync(promise, 'initial'), {
      initialProps: { promise: promise1 }
    });
    expect(result.current).toBe('initial');

    // Rerender with second promise
    rerender({ promise: promise2 });
    expect(result.current).toBe('initial');

    // Resolve promise1
    act(() => {
      resolve1('resolved');
    });

    await new Promise(res => setTimeout(res, 0));
    expect(result.current).toBe('initial');

    // Resolve promise2
    act(() => {
      resolve2('resolved');
    });

    await waitForNextUpdate();
    expect(result.current).toBe('resolved');
  });
});
