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
export type ResourceStatusEventListener = (event: ResourceStatusEvent) => void;
export class ResourceStatusEvent extends CustomEvent<ResourceStatus> {}

// Class
export class Resource<T> extends EventTarget {
  // Attributes
  private _state: ResourceState<T>;

  // Methods
  read(): T {
    switch (this._state.status) {
      case 'pending':
        throw new Promise<void>((resolve) => {
          const listener: ResourceStatusEventListener = (evt) => {
            if (evt.detail !== 'pending') {
              resolve();
              this.removeEventListener('status', listener);
            }
          };

          this.addEventListener('status', listener);
        });

      case 'success':
        return this._state.result;

      case 'error':
        throw this._state.result;
    }
  }

  update(result: T): void {
    this._state = { status: 'success', result };
    this.dispatchEvent(new ResourceStatusEvent('status', { detail: 'success' }));
  }

  error(result: Error): void {
    this._state = { status: 'error', result };
    this.dispatchEvent(new ResourceStatusEvent('status', { detail: 'error' }));
  }

  // Properties
  get status(): ResourceStatus {
    return this._state.status;
  }
}
