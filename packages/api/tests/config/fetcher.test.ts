import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

import { fetcher } from '../../src';

// Setup
enableFetchMocks();

let abort: AbortController;

beforeEach(() => {
  fetchMock.resetMocks();

  abort = new AbortController();
});

// Tests
describe('ApiConfigContext defaults (with fetch)', () => {
  describe('without body', () => {
    it('should use fetch to send a get request (arraybuffer response)', async () => {
      fetchMock.mockResponse('"test"', { status: 200 });

      // Call fetcher
      await expect(fetcher({ method: 'get', url: '/test', headers: {}, responseType: 'arraybuffer' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: expect.anything()
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'get',
        headers: expect.any(Headers),
        signal: abort.signal
      });
    });

    it('should use fetch to send a get request (blob response)', async () => {
      fetchMock.mockResponse('"test"', { status: 200 });

      // Call fetcher
      await expect(fetcher({ method: 'get', url: '/test', headers: {}, responseType: 'blob' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: expect.anything()
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'get',
        headers: expect.any(Headers),
        signal: abort.signal
      });
    });

    it('should use fetch to send a get request (json response)', async () => {
      fetchMock.mockResponse('"test"', { status: 200 });

      // Call fetcher
      await expect(fetcher({ method: 'get', url: '/test', headers: {}, responseType: 'json' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'get',
        headers: expect.any(Headers),
        signal: abort.signal
      });
    });

    it('should use fetch to send a get request (text response)', async () => {
      fetchMock.mockResponse('test', { status: 200 });

      // Call fetcher
      await expect(fetcher({ method: 'get', url: '/test', headers: {}, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'get',
        headers: expect.any(Headers),
        signal: abort.signal
      });
    });
  });

  describe('with body', () => {
    beforeEach(() => {
      fetchMock.mockResponse('test', { status: 200 });
    });

    it('should use fetch to send a post request (text body)', async () => {
      const headers = {
        'Content-Type': 'text/test'
      };
      const body = 'body';

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body,
        signal: abort.signal
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect((fetchMock.mock.calls[0][1]!.headers as Headers).get('Content-Type'))
        .toBe('text/test');
    });

    it('should use fetch to send a post request (ArrayBuffer body)', async () => {
      const body = new ArrayBuffer(5);

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body,
        signal: abort.signal
      });
    });

    it('should use fetch to send a post request (Blob body)', async () => {
      const body = new Blob();

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body,
        signal: abort.signal
      });
    });

    it('should use fetch to send a post request (FormData body)', async () => {
      const body = new FormData();

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body,
        signal: abort.signal
      });
    });

    it('should use fetch to send a post request (URLSearchParams body)', async () => {
      const body = new URLSearchParams();

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body,
        signal: abort.signal
      });
    });

    it('should use fetch to send a post request (object body)', async () => {
      const body = { test: true, id: 5 };

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body, responseType: 'text' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(fetchMock).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body: JSON.stringify(body),
        signal: abort.signal
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect((fetchMock.mock.calls[0][1]!.headers as Headers).get('Content-Type'))
        .toBe('application/json; charset=utf-8');
    });
  });
});
