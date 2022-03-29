import { ApiHeaders, ApiMethod, ApiRequest, ApiResponse } from '../types';

// Utils
function encodeBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined
    || typeof body === 'string'
    || body instanceof ArrayBuffer
    || body instanceof Blob
    || body instanceof FormData
    || body instanceof URLSearchParams
  ) {
    return body;
  }

  // Add content type header
  headers.set('Content-Type', 'application/json; charset=utf-8');

  return JSON.stringify(body);
}

function decodeHeaders(headers: Headers): ApiHeaders {
  const res: ApiHeaders = {};

  headers.forEach((v, k) => {
    res[k] = v;
  });

  return res;
}

/**
 * Default fetcher uses fetch API to send requests.
 *
 * It will encode body in JSON, expect if it's one of the following types:
 * - string
 * - ArrayBuffer
 * - Blob
 * - FormData
 * - URLSearchParams
 *
 * Those body types will be passed directly to fetch.
 *
 * @param req: request to send
 * @param signal: AbortSignal
 */
export async function fetcher<M extends ApiMethod, B, D>(req: ApiRequest<M, B>, signal: AbortSignal): Promise<ApiResponse<D>> {
  const headers = new Headers(req.headers);

  const res = await fetch(req.url, {
    method: req.method,
    headers,
    body: encodeBody(req.body, headers),
    signal
  });

  return {
    status: res.status,
    headers: decodeHeaders(res.headers),
    data: await res.json(),
  };
}
