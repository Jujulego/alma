import { act, renderHook } from '@testing-library/react-hooks';

import { Resource, useResource, Warehouse } from '../src';

// Setup
let warehouse: Warehouse;

beforeEach(() => {
  warehouse = new Warehouse();
});

// Tests
describe('useResource', () => {
  it('should create resource and return it', () => {
    // Initial render
    const { result, rerender } = renderHook(({ id }) => useResource(id, { warehouse }), {
      initialProps: {
        id: 'test1'
      }
    });

    expect(result.current).toBeInstanceOf(Resource);
    expect(result.current).toBe(warehouse.get('test1'));

    // Change key => recreate it
    rerender({ id: 'test2' });

    expect(result.current).toBe(warehouse.get('test2'));
  });

  it('should use creator to create new resource', () => {
    // Initial render
    const creator = jest.fn(() => new Resource());
    const { result } = renderHook(() => useResource('test', { creator, warehouse }));

    expect(creator).toHaveBeenCalled();
    expect(result.current).toBe(creator.mock.results[0].value);
    expect(result.current).toBe(warehouse.get('test'));
  });

  it('should follow resource updates', () => {
    // Initial render => create resource
    const { result } = renderHook(() => useResource('test', { warehouse }));

    expect(result.current).toBeInstanceOf(Resource);
    expect(result.current).toBe(warehouse.get('test'));

    // Recreate resource
    act(() => {
      warehouse.create('test');
    });

    expect(result.current).toBe(warehouse.get('test'));
  });
});
