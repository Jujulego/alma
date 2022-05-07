import { PromiseResource } from './promise-resource';

// Types
export interface AbortHolder {
  // Methods
  abort(): void;
}

// Class
/**
 * Promise based resource, with abort logic.
 * Allows to abort the given promise by using the given AbortHolder (like an AbortController).
 */
export class AbortResource<T> extends PromiseResource<T> implements AbortHolder {
  // Attributes
  private _subscribers = 0;
  private readonly _abortHolder: AbortHolder;

  // Constructor
  constructor(promise: PromiseLike<T>, abortHolder: AbortHolder) {
    super(promise);

    this._abortHolder = abortHolder;
  }

  // Methods
  then<R1 = T, R2 = never>(onfulfilled?: (data: T) => (PromiseLike<R1> | R1), onrejected?: (reason: unknown) => (PromiseLike<R2> | R2)): AbortResource<R1 | R2> {
    return new AbortResource(super.then(onfulfilled, onrejected), this);
  }

  catch<R = never>(onrejected: (reason: unknown) => R | PromiseLike<R>): AbortResource<T | R> {
    return this.then((data) => data, onrejected);
  }

  /**
   * Aborts inner promise using given AbortHolder
   */
  abort(): void {
    this._abortHolder.abort();
  }

  read(): T {
    this._subscribers++;
    return super.read();
  }

  /**
   * Will call cb when the promise completes.
   * Returns an unsubscribe function, witch prevent cb to be called.
   * If all subscribers had unsubscribe, then the promise will be aborted.
   *
   * @param cb
   */
  subscribe(cb: (res: T) => void): () => void {
    let subscribed = true;
    this._subscribers++;

    this.then((res) => {
      if (subscribed) cb(res);
    });

    return () => {
      this._subscribers--;
      subscribed = false;

      // setTimeout required to prevent useEffect to cancel request in api
      setTimeout(() => {
        if (this._subscribers <= 0 && this.status === 'pending') {
          this.abort();
        }
      });
    };
  }
}
