import { renderHook } from '@testing-library/react-hooks';

import { ApiConfigContext, ApiFetcher, ApiRequest, ApiResource, ApiResponse, useApiRequest } from '../../src';

// Setup
const fetcher: jest.MockedFunction<ApiFetcher> = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();

  fetcher.mockImplementation(() => new Promise<ApiResponse<string>>((resolve) => {
    setTimeout(() => resolve({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: 'success'
    }), 1);
  }));
});

// Tests
describe('useApiSend', () => {
  it('should use fetcher to send request, then build an ApiResource with the promise', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const req: ApiRequest<'get', 'text'> = { method: 'get', url: '/test', headers: {}, responseType: 'text' };
    const res = result.current.request(req);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(req, expect.any(AbortSignal));

    expect(res).toBeInstanceOf(ApiResource);
    expect(res.status).toBe('pending');

    // End request
    jest.runAllTimers();

    await expect(res).resolves.toEqual({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: 'success'
    });
    expect(res.read()).toEqual({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: 'success'
    });
    expect(res.status).toBe('success');
  });
});
