import { act, renderHook } from '@testing-library/react-hooks';

import { ApiConfigContext, ApiPromise, ApiResponse, useApiRequest } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useApiRequest', () => {
  // Tests
  it('should call request generator on send call', async () => {
    // Mocks
    let response: (error: unknown) => void = () => undefined;
    const fetcher = jest.fn().mockReturnValue(new Promise((resolve) => {
      response = (data) => resolve({
        status: 200,
        headers: {
          TEST: 'test'
        },
        data
      });
    }));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(fetcher).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/test',
      headers: {
        TEST: 'test',
      }
    }, expect.any(AbortSignal));

    // After receive
    await act(async () => {
      response('success');

      await expect(prom).resolves.toEqual({
        status: 200,
        headers: {
          TEST: 'test',
        },
        data: 'success'
      });
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should reset loading if request failed', async () => {
    // Mocks
    let response: (error: unknown) => void = () => undefined;
    const fetcher = jest.fn().mockReturnValue(new Promise((resolve, reject) => {
      response = (error) => reject(error);
    }));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      response(new Error('Request failed'));

      await expect(prom).rejects.toEqual(new Error('Request failed'));
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });
  });

  it('should abort request on request cancel', async () => {
    // Mocks
    const fetcher = jest.fn().mockReturnValue(new Promise(() => null));

    // Render
    const { result } = renderHook(() => useApiRequest<'get', unknown, string>(), {
      wrapper: ({ children }) => (
        <ApiConfigContext.Provider value={{ fetcher }}>
          { children }
        </ApiConfigContext.Provider>
      )
    });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.send({
        method: 'get',
        url: '/api/test',
        headers: {
          TEST: 'test',
        },
      });
    });

    expect(fetcher).toHaveBeenCalledTimes(1);

    // Abort !
    act(() => {
      prom.cancel();
    });

    expect(fetcher.mock.calls[0][1].aborted).toBe(true);
  });
});
