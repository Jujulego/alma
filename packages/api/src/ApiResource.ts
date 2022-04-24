import { AbortResource } from '@jujulego/alma-resources';

import { ApiResponse } from './types';

// Class
export class ApiResource<D> extends AbortResource<ApiResponse<D>> {
  // Attributes
  private _subscribers = 0;

  // Constructor
  constructor(promise: Promise<ApiResponse<D>>, abort: AbortController) {
    super(promise, abort);
  }

  // Methods
  /**
   * Will call cb when the promise completes.
   * Returns an unsubscribe function, witch prevent cb to be called.
   * If all subscribers had unsubscribe, then the promise will be aborted.
   *
   * @param cb
   */
  subscribe(cb: (res: ApiResponse<D>) => void): () => void {
    let subscribed = true;
    this._subscribers++;

    this.then((res) => {
      if (subscribed) cb(res);
    });

    return () => setTimeout(() => {
      this._subscribers--;
      subscribed = false;

      if (this._subscribers <= 0 && this.status === 'pending') {
        this.abort();
      }
    });
  }
}
