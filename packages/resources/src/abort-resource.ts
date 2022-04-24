import { PromiseResource } from './promise-resource';

// Types
export interface AbortHolder {
  // Methods
  abort(): void;
}

// Class
export class AbortResource<T> extends PromiseResource<T> implements AbortHolder {
  // Constructor
  constructor(
    _promise: PromiseLike<T>,
    private readonly _abortHolder: AbortHolder,
  ) {
    super(_promise);
  }

  // Methods
  then<R1 = T, R2 = never>(onfulfilled?: (res: T) => (PromiseLike<R1> | R1), onrejected?: (reason: unknown) => (PromiseLike<R2> | R2)): AbortResource<R1 | R2> {
    return new AbortResource(super.then(onfulfilled, onrejected), this);
  }

  abort(): void {
    this._abortHolder.abort();
  }
}
