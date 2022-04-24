import { Resource } from './resource';

// Class
export class PromiseResource<T> extends Resource<T> implements PromiseLike<T> {
  // Constructor
  constructor(
    private readonly _promise: PromiseLike<T>
  ) {
    super();

    // Link the promise to the resource
    this._promise.then(
      (res) => this.success(res),
      (err) => this.error(err)
    );
  }

  // Methods
  then<R1 = T, R2 = never>(onfulfilled?: (res: T) => R1 | PromiseLike<R1>, onrejected?: (reason: unknown) => R2 | PromiseLike<R2>): PromiseResource<R1 | R2> {
    return new PromiseResource<R1 | R2>(this._promise.then(onfulfilled, onrejected));
  }
}
