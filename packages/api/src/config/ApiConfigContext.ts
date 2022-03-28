import { createContext } from 'react';

import { ApiHeaders, ApiMethod, ApiRequest, ApiResponse } from '../types';

// Types
export type ApiFetcher = <M extends ApiMethod, B, D>(req: ApiRequest<M, B>, signal: AbortSignal) => Promise<ApiResponse<D>>;

export interface ApiConfigContext {
  fetcher: ApiFetcher;
}

// Utils
function encodeBody(body?: unknown): BodyInit | undefined {
  if (body === undefined
    || body instanceof ArrayBuffer
    || body instanceof Blob
    || body instanceof FormData
    || body instanceof URLSearchParams
  ) {
    return body;
  }

  return JSON.stringify(body);
}

function decodeHeaders(headers: Headers): ApiHeaders {
  const res: ApiHeaders = {};

  headers.forEach((v, k) => {
    res[k] = v;
  });

  return res;
}

// Context
export const ApiConfigContext = createContext<ApiConfigContext>({
  fetcher: async <M extends ApiMethod, B, D>(req: ApiRequest<M, B>, signal: AbortSignal): Promise<ApiResponse<D>> => {
    const res = await fetch(req.url, {
      method: req.method,
      headers: new Headers(req.headers),
      body: encodeBody(req.body),
      signal
    });

    return {
      status: res.status,
      headers: decodeHeaders(res.headers),
      data: await res.json(),
    };
  }
});
