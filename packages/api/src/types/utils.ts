// Types
export type ApiHeaders = Record<string, string>;
export type ApiMethod = 'get' | 'head' | 'options' | 'delete' | 'post' | 'patch' | 'put';
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
