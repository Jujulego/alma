import { act, renderHook } from '@testing-library/react-hooks';

import { GLOBAL_WAREHOUSE, Resource, useResource } from '../src';

// Setup
beforeEach(() => {
  delete self[GLOBAL_WAREHOUSE];
});

// Tests
describe('useResource', () => {
  it('should follow resource updates', () => {
    // Initial render
    const { result } = renderHook(() => useResource('test'));

    expect(result.current).toBeUndefined();

    // Create resource
    act(() => {
      self[GLOBAL_WAREHOUSE]?.create('test');
    });

    expect(result.current).toBeInstanceOf(Resource);
    expect(result.current).toBe(self[GLOBAL_WAREHOUSE]?.get('test'));

    // Recreate resource
    act(() => {
      self[GLOBAL_WAREHOUSE]?.create('test');
    });

    expect(result.current).toBe(self[GLOBAL_WAREHOUSE]?.get('test'));
  });

  it('should create resource inside global warehouse and return it', () => {
    // Initial render
    const { result, rerender } = renderHook(({ rkey }) => useResource(rkey, { create: true }), {
      initialProps: {
        rkey: 'test1'
      }
    });

    expect(result.current).toBeInstanceOf(Resource);
    expect(result.current).toBe(self[GLOBAL_WAREHOUSE]?.get('test1'));

    // Change key
    rerender({ rkey: 'test2' });

    expect(result.current).toBe(self[GLOBAL_WAREHOUSE]?.get('test2'));
  });
});
