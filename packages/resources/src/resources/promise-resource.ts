import { Resource } from './resource';

// Class
/**
 * Promise based resource. Will be successful when the given promise resolves.
 * Behave also as a promise, and can be awaited.
 */
export class PromiseResource<T> extends Resource<T> implements PromiseLike<T> {
  // Attributes
  private readonly _promise: PromiseLike<T>;

  // Constructor
  constructor(promise: PromiseLike<T>) {
    super();

    // Link the promise to the resource
    this._promise = promise;
    this._promise.then(
      (res) => this.success(res),
      (err) => this.error(err)
    );
  }

  // Methods
  then<R1 = T, R2 = never>(onfulfilled?: (data: T) => R1 | PromiseLike<R1>, onrejected?: (reason: unknown) => R2 | PromiseLike<R2>): PromiseResource<R1 | R2> {
    return new PromiseResource<R1 | R2>(this._promise.then(onfulfilled, onrejected));
  }

  catch<R = never>(onrejected: (reason: unknown) => R | PromiseLike<R>): PromiseResource<T | R> {
    return this.then((data) => data, onrejected);
  }
}
