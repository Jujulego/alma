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
describe('useApiSend.request', () => {
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

describe('useApiSend.get', () => {
  it('should use fetcher to send a get request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.get('/test', { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'get',
      url: '/test',
      headers,
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a get request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.get('/test');

    expect(fetcher).toHaveBeenCalledWith({
      method: 'get',
      url: '/test',
      headers: {},
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.head', () => {
  it('should use fetcher to send a head request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.head('/test', { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'head',
      url: '/test',
      headers,
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a head request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.head('/test');

    expect(fetcher).toHaveBeenCalledWith({
      method: 'head',
      url: '/test',
      headers: {},
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.options', () => {
  it('should use fetcher to send a options request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.options('/test', { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'options',
      url: '/test',
      headers,
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a options request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.options('/test');

    expect(fetcher).toHaveBeenCalledWith({
      method: 'options',
      url: '/test',
      headers: {},
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.delete', () => {
  it('should use fetcher to send a delete request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.delete('/test', { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'delete',
      url: '/test',
      headers,
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a delete request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.delete('/test');

    expect(fetcher).toHaveBeenCalledWith({
      method: 'delete',
      url: '/test',
      headers: {},
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.post', () => {
  it('should use fetcher to send a post request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.post('/test', { test: 'success' }, { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'post',
      url: '/test',
      headers,
      body: { test: 'success' },
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a post request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.post('/test', { test: 'success' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'post',
      url: '/test',
      headers: {},
      body: { test: 'success' },
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.patch', () => {
  it('should use fetcher to send a patch request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.patch('/test', { test: 'success' }, { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'patch',
      url: '/test',
      headers,
      body: { test: 'success' },
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a patch request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.patch('/test', { test: 'success' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'patch',
      url: '/test',
      headers: {},
      body: { test: 'success' },
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});

describe('useApiSend.put', () => {
  it('should use fetcher to send a put request', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    const headers = { TEST: '1' };
    result.current.put('/test', { test: 'success' }, { headers, responseType: 'text' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'put',
      url: '/test',
      headers,
      body: { test: 'success' },
      responseType: 'text'
    }, expect.any(AbortSignal));
  });

  it('should use fetcher to send a put request (default values)', async () => {
    // Render
    const { result } = renderHook(() => useApiRequest(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    // Run new request
    result.current.put('/test', { test: 'success' });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'put',
      url: '/test',
      headers: {},
      body: { test: 'success' },
      responseType: 'json'
    }, expect.any(AbortSignal));
  });
});
