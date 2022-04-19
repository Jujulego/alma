import { Resource } from './resource';

// Constants
export const GLOBAL_WAREHOUSE = Symbol('jujulego:alma-resources:global-warehouse');

// Types
declare global {
  interface Window {
    [GLOBAL_WAREHOUSE]?: Warehouse;
  }
}

// Events
export interface WarehouseUpdateEvent<T = unknown> extends Event {
  // Attributes
  type: 'update';

  /**
   * Updated key
   */
  readonly key: string;

  /**
   * New resource that took place
   */
  readonly newResource: Resource<T>;

  /**
   * Old resource that has been replaced
   */
  readonly oldResource?: Resource<T>;
}

/**
 * Emitted when a resource is updated
 */
export class WarehouseUpdateEvent<T = unknown> extends Event {
  // Constructor
  constructor(
    readonly key: string,
    readonly newResource: Resource<T>,
    readonly oldResource?: Resource<T>,
  ) {
    super('update');
  }
}

export type WarehouseUpdateEventListener<T = unknown> = (event: WarehouseUpdateEvent<T>) => void;

// Warehouse
export interface Warehouse extends EventTarget {
  // Methods
  dispatchEvent(event: WarehouseUpdateEvent): boolean;
  addEventListener<T = unknown>(type: 'update', callback: WarehouseUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener<T = unknown>(type: 'update', callback: WarehouseUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;
}

export class Warehouse extends EventTarget {
  // Attributes
  private readonly _resources = new Map<string, Resource<unknown>>();

  // Methods
  /**
   * Create a new resource. Erase previous resource at the same key.
   * @param key
   */
  create<T>(key: string): Resource<T> {
    const res = new Resource<T>();
    this.set(key, res);

    return res;
  }

  /**
   * Returns the resource associated to the key, if any.
   * @param key
   */
  get<T, R extends Resource<T> = Resource<T>>(key: string): R | undefined {
    return this._resources.get(key) as R | undefined;
  }

  /**
   * Returns the resource associated to the key, if not found return a new one.
   * @param key
   */
  getOrCreate<T>(key: string): Resource<T> {
    return this.get(key) || this.create(key);
  }

  /**
   * Update resource at the given key.
   * Returns the previous resource, if any.
   *
   * @param key
   * @param resource
   */
  set(key: string, resource: Resource<unknown>): Resource<unknown> | undefined {
    const old = this._resources.get(key);
    this._resources.set(key, resource);

    this.dispatchEvent(new WarehouseUpdateEvent(key, resource, old));

    return old;
  }
}

// Utils
export function globalWarehouse(): Warehouse {
  return self[GLOBAL_WAREHOUSE] ??= new Warehouse();
}
