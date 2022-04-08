// Types
export type ApiMethod = 'get' | 'head' | 'options' | 'delete' | 'post' | 'patch' | 'put';
export type ApiHeaders = Record<string, string>;
export type ApiResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

// Utils
export interface ApiRTConstraint {
  arraybuffer: ArrayBuffer;
  blob: Blob;
  json: unknown;
  text: string;
}
