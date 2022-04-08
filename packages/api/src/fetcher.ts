import { ApiHeaders, ApiRequest, ApiResponseFor, ApiRTConstraint } from './types';
import { ApiResponseType } from '../old';

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

async function decodeBody<RT extends ApiResponseType>(responseType: RT, res: Response): Promise<ApiRTConstraint[RT]> {
  switch (responseType) {
    case 'arraybuffer':
      return await res.arrayBuffer() as ApiRTConstraint[RT];

    case 'blob':
      return await res.blob() as ApiRTConstraint[RT];

    case 'json':
      return await res.json() as ApiRTConstraint[RT];

    case 'text':
      return await res.text() as ApiRTConstraint[RT];
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
export async function fetcher<Rq extends ApiRequest>(req: Rq, signal: AbortSignal): Promise<ApiResponseFor<Rq>> {
  const headers = new Headers(req.headers);

  const res = await fetch(req.url, {
    method: req.method,
    headers,
    body: encodeBody(req.body, headers),
    signal
  });

  return {
    status: res.status,
    statusText: res.statusText,
    headers: decodeHeaders(res.headers),
    data: await decodeBody<Rq['responseType']>(req.responseType, res),
  };
}
