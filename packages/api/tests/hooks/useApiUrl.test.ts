import { renderHook } from '@testing-library/react-hooks';

import { url, useApiUrl } from '../../src';

// Tests
describe('useApiUrl', () => {
  it('should return a stable builder for the given string url', async () => {
    // Render
    const { result, rerender } = renderHook(() => useApiUrl('/test/8'));
    rerender();

    // Checks
    expect(result.current()).toBe('/test/8');

    expect(result.all).toHaveLength(2);
    expect(result.all[1]).toBe(result.all[0]);
  });

  it('should return a the given builder', async () => {
    // Render
    const { result, rerender } = renderHook(() => useApiUrl((id: number) => `/test/${id}`));
    rerender();

    // Checks
    expect(result.current(8)).toBe('/test/8');

    expect(result.all).toHaveLength(2);
    expect(result.all[1]).not.toBe(result.all[0]);
  });

  it('should return a stable builder for the given url template', async () => {
    // Render
    const { result, rerender } = renderHook(() => useApiUrl(url`/test/${'id'}`));
    rerender();

    // Checks
    expect(result.current({ id: 8 })).toBe('/test/8');

    expect(result.all).toHaveLength(2);
    expect(result.all[1]).toBe(result.all[0]);
  });
});
