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
describe('Warehouse.create', () => {
  it('should create a new resource and emit an update event', () => {
    const res = warehouse.create('test');

    expect(res).toBeInstanceOf(Resource);
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
  });

  it('should use creator to create new resource', () => {
    const creator = jest.fn(() => new Resource());
    const res = warehouse.create('test', creator);

    expect(creator).toHaveBeenCalled();
    expect(res).toBe(creator.mock.results[0].value);
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
  });

  it('should replace an existing resource', () => {
    const old = warehouse.create('test');
    const res = warehouse.create('test');

    expect(res).not.toBe(old);
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', old));
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res, old));
  });
});

describe('Warehouse.getOrCreate', () => {
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

  it('should use creator to create new resource', () => {
    const creator = jest.fn(() => new Resource());
    const res = warehouse.getOrCreate('test', creator);

    expect(creator).toHaveBeenCalled();
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
  });
});

describe('Warehouse.set', () => {
  it('should add a new resource', () => {
    const res = new Resource();

    expect(warehouse.set('test', res)).toBeUndefined();
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(1);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res));
  });
  
  it('should replace an existing resource', () => {
    const old = warehouse.create('test');
    const res = new Resource();

    expect(warehouse.set('test', res)).toBe(old);
    expect(warehouse.get('test')).toBe(res);
    expect(updateEventSpy).toHaveBeenCalledTimes(2);
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', old));
    expect(updateEventSpy).toHaveBeenCalledWith(new WarehouseUpdateEvent('test', res, old));
  });
});

describe('Warehouse.remove', () => {
  it('should remove an existing resource', () => {
    const res = warehouse.create('test');

    expect(warehouse.remove('test')).toBe(res);
    expect(warehouse.get('test')).toBeUndefined();
  });

  it('should do nothing if nothing to delete', () => {
    expect(warehouse.remove('test')).toBeUndefined();
  });
});

describe('Warehouse.clear', () => {
  it('should remove all existing resource', () => {
    warehouse.create('test');
    warehouse.clear();

    expect(warehouse.get('test')).toBeUndefined();
  });
});
