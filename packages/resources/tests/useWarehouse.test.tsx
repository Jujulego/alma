import { renderHook } from '@testing-library/react-hooks';

import { GLOBAL_WAREHOUSE, useWarehouse, Warehouse, WarehouseCtx, WarehouseKeeper } from '../src';

// Setup
beforeEach(() => {
  delete self[GLOBAL_WAREHOUSE];
});

// Tests
describe('useWarehouse', () => {
  it('should return context instance of Warehouse', () => {
    const warehouse = new Warehouse();
    const { result } = renderHook(() => useWarehouse(), {
      wrapper: ({ children }) => <WarehouseCtx.Provider value={warehouse}>{ children }</WarehouseCtx.Provider>
    });

    expect(self[GLOBAL_WAREHOUSE]).toBeUndefined();
    expect(result.current).toBe(warehouse);
  });

  it('should return keeper\'s instance of Warehouse', () => {
    const { result } = renderHook(() => useWarehouse(), {
      wrapper: ({ children }) => <WarehouseKeeper>{ children }</WarehouseKeeper>
    });

    expect(self[GLOBAL_WAREHOUSE]).toBeUndefined();
    expect(result.current).toBeInstanceOf(Warehouse);
  });

  it('should return global instance of Warehouse', () => {
    const { result } = renderHook(() => useWarehouse());

    expect(self[GLOBAL_WAREHOUSE]).toBeInstanceOf(Warehouse);
    expect(result.current).toBe(self[GLOBAL_WAREHOUSE]);
  });
});
