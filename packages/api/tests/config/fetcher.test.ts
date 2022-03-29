import { enableFetchMocks } from 'jest-fetch-mock';

import { fetcher } from '../../src';

// Setup
enableFetchMocks();

let abort: AbortController;

beforeEach(() => {
  global.fetch.resetMocks();

  abort = new AbortController();
});

// Tests
describe('ApiConfigContext defaults (with fetch)', () => {
  describe('without body', () => {
    it('should use fetch to send a get request (json response)', async () => {
      global.fetch.mockResponse('"test"', { status: 200 });

      // Call fetcher
      await expect(fetcher({ method: 'get', url: '/test', headers: {} }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(global.fetch).toHaveBeenCalledWith('/test', {
        method: 'get',
        headers: expect.any(Headers),
        signal: abort.signal
      });
    });
  });

  describe('with body', () => {
    beforeEach(() => {
      global.fetch.mockResponse('"test"', { status: 200 });
    });

    it('should use fetch to send a post request (text body)', async () => {
      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body: 'body' }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(global.fetch).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body: 'body',
        signal: abort.signal
      });
    });

    it('should use fetch to send a post request (object body)', async () => {
      const body = { test: true, id: 5 };

      // Call fetcher
      await expect(fetcher({ method: 'post', url: '/test', headers: {}, body }, abort.signal))
        .resolves.toEqual({
          status: 200,
          headers: expect.anything(),
          data: 'test'
        });

      expect(global.fetch).toHaveBeenCalledWith('/test', {
        method: 'post',
        headers: expect.any(Headers),
        body: JSON.stringify(body),
        signal: abort.signal
      });

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { headers } = global.fetch.mock.calls[0][1]!;
      expect((headers as Headers).get('Content-Type')).toBe('application/json; charset=utf-8');
    });
  });
});
