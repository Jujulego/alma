import axios from 'axios';

import { fetcher } from '../src';
import { ApiRequest } from '@jujulego/alma-api/src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('fetcher', () => {
  it('should send request with axios', async () => {
    // Mocks
    jest.spyOn(axios, 'request')
      .mockResolvedValue({
        status: 200,
        data: { test: 'success' },
      });

    // Checks
    const abort = new AbortController();
    const req: ApiRequest<'get', 'json'> = {
      method: 'get',
      url: '/api/test',
      headers: {
        Test: 'true'
      },
      responseType: 'json',
    };

    await expect(fetcher(req, abort.signal))
      .resolves.toEqual({
        status: 200,
        data: { test: 'success' }
      });

    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/test',
      headers: {
        Test: 'true'
      },
      responseType: 'json',
      signal: abort.signal
    });
  });
});
