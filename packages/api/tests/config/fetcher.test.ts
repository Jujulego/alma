import { enableFetchMocks } from 'jest-fetch-mock';

import { fetcher } from '../../src';

// Setup
enableFetchMocks();

beforeEach(() => {
  global.fetch.resetMocks();
});

// Tests
describe('ApiConfigContext defaults (with fetch)', () => {
  it('should use fetch to send a get request', async () => {
    global.fetch.mockResponse('"test"', { status: 200 });

    // Mocks
    const abort = new AbortController();

    // Call fetcher
    await expect(fetcher({ method: 'get', url: '/test', headers: {} }, abort.signal))
      .resolves.toEqual({
        status: 200,
        headers: expect.anything(),
        data: 'test'
      });

    expect(fetch).toHaveBeenCalledWith('/test', {
      method: 'get',
      headers: expect.any(Headers),
      signal: abort.signal
    });
  });

  it('should use fetch to send a post request', async () => {
    global.fetch.mockResponse('"test"', { status: 200 });

    // Mocks
    const abort = new AbortController();

    // Call fetcher
    await expect(fetcher({ method: 'post', url: '/test', headers: {}, body: 'body' }, abort.signal))
      .resolves.toEqual({
        status: 200,
        headers: expect.anything(),
        data: 'test'
      });

    expect(fetch).toHaveBeenCalledWith('/test', {
      method: 'post',
      headers: expect.any(Headers),
      body: '"body"',
      signal: abort.signal
    });
  });
});
