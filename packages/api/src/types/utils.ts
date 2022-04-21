// Types
/**
 * All HTTP methods that **does not carry** a body
 */
export type ApiQueryMethod = 'get' | 'head' | 'options' | 'delete';

/**
 * All HTTP methods that **carry** a body
 */
export type ApiMutationMethod = 'post' | 'patch' | 'put';

export type ApiMethod = ApiQueryMethod | ApiMutationMethod;

export type ApiHeaders = Record<string, string>;

export type ApiResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

// Utils
export type ApiDataConstraint<RT extends ApiResponseType | undefined> =
  RT extends 'arraybuffer' ? ArrayBuffer :
    RT extends 'blob' ? Blob :
      RT extends 'text' ? string : unknown;

export type ApiResponseTypeFor<D> =
  D extends ArrayBuffer ? 'arraybuffer' :
    D extends Blob ? 'blob' :
      D extends string ? 'text' | 'json' : 'json';
