import { PromiseResource } from './promise-resource';

// Types
export interface AbortHolder {
  // Methods
  abort(): void;
}

// Class
export class AbortResource<T> extends PromiseResource<T> implements AbortHolder {
  // Attributes
  private _subscribers = 0;

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
