import { Resource, Warehouse, WarehouseUpdateEvent } from '../src';

// Setup
let warehouse: Warehouse;
const updateEventSpy = jest.fn<void, [WarehouseUpdateEvent<string>]>();

beforeEach(() => {
  warehouse = new Warehouse();

  updateEventSpy.mockReset();
  warehouse.addEventListener('update', updateEventSpy);
});

// Tests
it('should create a new resource and emit an update event', () => {
  const res = warehouse.create('test');

  expect(res).toBeInstanceOf(Resource);
  expect(warehouse.get('test')).toBe(res);
  expect(updateEventSpy).toHaveBeenCalledTimes(1);
  expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
});

it('should replace an existing resource', () => {
  const old = warehouse.create('test');
  const res = warehouse.create('test');

  expect(warehouse.get('test')).toBe(res);
  expect(updateEventSpy).toHaveBeenCalledTimes(2);
  expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', old));
  expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res, old));
});

it('should not replace an existing resource', () => {
  const old = warehouse.create('test');
  const res = warehouse.getOrCreate('test');

  expect(res).toBe(old);
  expect(warehouse.get('test')).toBe(old);
  expect(updateEventSpy).toHaveBeenCalledTimes(1);
  expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', old));
});

it('should create a missing resource', () => {
  const res = warehouse.getOrCreate('test');

  expect(warehouse.get('test')).toBe(res);
  expect(updateEventSpy).toHaveBeenCalledTimes(1);
  expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
});
