import { Resource } from '@jujulego/alma-resources';

import { ApiResponse } from './types';

// ApiResource
export class ApiResource<D> extends Resource<ApiResponse<D>> implements PromiseLike<ApiResponse<D>> {
  // Constructor
  constructor(
    private readonly _promise: Promise<ApiResponse<D>>,
    private readonly _abort: AbortController,
  ) {
    super();

    // Link the promise to the resource
    this._promise.then((res) => this.success(res));
    this._promise.catch((err) => this.error(err));
  }

  // Methods
  then<R1 = ApiResponse<D>, R2 = never>(onfulfilled?: (res: ApiResponse<D>) => R1 | PromiseLike<R1>, onrejected?: (reason: unknown) => R2 | PromiseLike<R2>): PromiseLike<R1 | R2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  cancel(): void {
    if (this.status === 'pending') {
      this._abort.abort();
    }
  }
}
