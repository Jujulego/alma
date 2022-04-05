// Types
interface ResourceStatePending {
  readonly status: 'pending';
  readonly result?: undefined;
}

interface ResourceStateSuccess<T> {
  readonly status: 'success';
  readonly result: T;
}

interface ResourceStateError {
  readonly status: 'error';
  readonly result: Error;
}

export type ResourceState<T> = ResourceStatePending | ResourceStateSuccess<T> | ResourceStateError;
export type ResourceStatus = ResourceState<unknown>['status'];

// Events
export interface ResourceUpdateEvent<T> extends Event {
  // Attributes
  type: 'update';
}

export class ResourceUpdateEvent<T> extends Event {
  // Constructor
  constructor(
    readonly newState: Readonly<ResourceState<T>>
  ) {
    super('update');
  }
}

export type ResourceUpdateEventListener<T> = (event: ResourceUpdateEvent<T>) => void;

// Resource
export interface Resource<T> extends EventTarget {
  // Methods
  dispatchEvent(event: ResourceUpdateEvent<T>): boolean;
  addEventListener(type: 'update', callback: ResourceUpdateEventListener<T>, options?: AddEventListenerOptions | boolean): void;
  removeEventListener(type: 'update', callback: ResourceUpdateEventListener<T>, options?: EventListenerOptions | boolean): void;
}

export class Resource<T> extends EventTarget {
  // Attributes
  private _state: ResourceState<T>;

  // Methods
  read(): T {
    switch (this._state.status) {
      case 'pending':
        throw new Promise<void>((resolve) => {
          const listener: ResourceUpdateEventListener<T> = (evt) => {
            if (evt.newState.status !== 'pending') {
              resolve();
              this.removeEventListener('update', listener);
            }
          };

          this.addEventListener('update', listener);
        });

      case 'success':
        return this._state.result;

      case 'error':
        throw this._state.result;
    }
  }

  success(result: T): void {
    this._state = { status: 'success', result };
    this.dispatchEvent(new ResourceUpdateEvent<T>(this._state));
  }

  error(result: Error): void {
    this._state = { status: 'error', result };
    this.dispatchEvent(new ResourceUpdateEvent<T>(this._state));
  }

  // Properties
  get status(): ResourceStatus {
    return this._state.status;
  }
}
