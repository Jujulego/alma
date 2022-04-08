import { ApiHeaders, ApiMethod, ApiRequest, ApiResponse, ApiResponseType, ApiRTConstraint } from '../types';

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

async function decodeBody<T extends ApiResponseType, D extends ApiRTConstraint[T]>(responseType: T, res: Response): Promise<D> {
  switch (responseType) {
    case 'arraybuffer':
      return await res.arrayBuffer() as D;

    case 'blob':
      return await res.blob() as D;

    case 'json':
      return await res.json() as D;

    case 'text':
      return await res.text() as D;
  }

  throw new Error(`Unsupported responseType ${responseType}`);
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
 * @param signal: AbortSignal used to interrupt the call
 */
export async function fetcher<M extends ApiMethod, B, D extends ApiRTConstraint[T], T extends ApiResponseType>(req: ApiRequest<M, T, B>, signal: AbortSignal): Promise<ApiResponse<T, D>> {
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
    data: await decodeBody(req.responseType, res),
  };
}
