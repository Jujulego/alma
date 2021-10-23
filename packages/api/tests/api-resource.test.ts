import { act, renderHook } from '@testing-library/react-hooks';

import {
  apiResource, ApiPromise, ApiResponse, makeApiPromise,
  useApiAutoLoad as _useApiAutoLoad,
  useApiDelete as _useApiDelete,
  useApiGet as _useApiGet,
  useApiPut as _useApiPut
} from '../src';

// Mocks
jest.mock('../src/api/useApiAutoLoad');
const useApiAutoLoad = _useApiAutoLoad as jest.MockedFunction<typeof _useApiAutoLoad>;

jest.mock('../src/api/useApiDelete');
const useApiDelete = _useApiDelete as jest.MockedFunction<typeof _useApiDelete>;

jest.mock('../src/api/useApiGet');
const useApiGet = _useApiGet as jest.MockedFunction<typeof _useApiGet>;

jest.mock('../src/api/useApiPut');
const useApiPut = _useApiPut as jest.MockedFunction<typeof _useApiPut>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useApiGet.mockReturnValue({
    loading: false,
    send: jest.fn()
  });

  useApiAutoLoad.mockReturnValue({
    loading: false,
    data: 'test',
    reload: jest.fn(),
    setData: jest.fn()
  });
});

// Test suites
describe('apiResource', () => {
  // Tests
  it('should call useApiAutoLoad with given url and hook and return results', () => {
    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test');
    const { result } = renderHook(() => useApiTest());

    // Check
    expect(result.current).toEqual({
      loading: false,
      data: 'test',
      reload: expect.any(Function),
      setData: expect.any(Function),
    });

    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
  });

  it('should call useApiAutoLoad with built url', () => {
    // Render
    const useApiTest = apiResource<string, number>(useApiGet, (id: number) => `/api/test/${id}`);
    const { result } = renderHook(() => useApiTest(1));

    // Check
    expect(result.current).toEqual({
      loading: false,
      data: 'test',
      reload: expect.any(Function),
      setData: expect.any(Function),
    });

    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test/1');
  });
});

describe('apiResource.query', () => {
  // Tests
  it('should call useApiDelete with same url', async () => {
    // Mocks
    let respond: (data: string) => void = () => undefined;
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [string]>()
      .mockReturnValue(makeApiPromise(new Promise((resolve) => {
        respond = (data) => resolve({
          status: 200,
          headers: {},
          data,
        });
      }), jest.fn()));

    const spyMerge = jest.fn();
    const spyUpdate = jest.fn();

    useApiAutoLoad.mockReturnValue({
      loading: false,
      data: 'test',
      reload: jest.fn(),
      setData: spyUpdate
    });

    useApiDelete.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .query('remove', useApiDelete, null, spyMerge);

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(result.current).toEqual(expect.objectContaining({
      remove: expect.any(Function),
    }));

    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiDelete).toHaveBeenCalledWith('/api/test');

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.remove();
    });

    expect(spySend).toHaveBeenCalledWith(undefined);

    // After receive
    await act(async () => {
      respond('deleted');

      await expect(prom).resolves.toEqual({
        status: 200,
        headers: {},
        data: 'deleted'
      });
    });

    expect(spyUpdate).toHaveBeenCalledWith(expect.any(Function));
    
    // Check updator
    const updator = spyUpdate.mock.calls[0][0];

    expect(updator('test')).toBeUndefined();
    expect(spyMerge).toHaveBeenCalledWith('test', 'deleted');
  });

  it('should call useApiDelete with new url', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [string]>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), jest.fn()));

    useApiDelete.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .query('remove', useApiDelete, '/api/test/delete', jest.fn());

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiDelete).toHaveBeenCalledWith('/api/test');

    // Call send
    act(() => {
      result.current.remove();
    });

    expect(spySend).toHaveBeenCalledWith('/api/test/delete');
  });

  it('should call useApiDelete with built url', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [string]>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), jest.fn()));

    useApiDelete.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .query('remove', useApiDelete, (id: number) => `/api/test/${id}/delete`, jest.fn());

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiDelete).toHaveBeenCalledWith('/api/test');

    // Call send
    act(() => {
      result.current.remove(1);
    });

    expect(spySend).toHaveBeenCalledWith('/api/test/1/delete');
  });
});

describe('apiResource.mutate', () => {
  // Tests
  it('should call useApiPut with same url', async () => {
    // Mocks
    let respond: (data: string) => void = () => undefined;
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [number, string]>()
      .mockReturnValue(makeApiPromise(new Promise((resolve) => {
        respond = (data) => resolve({
          status: 200,
          headers: {},
          data,
        });
      }), jest.fn()));

    const spyMerge = jest.fn();
    const spyUpdate = jest.fn();

    useApiAutoLoad.mockReturnValue({
      loading: false,
      data: 'test',
      reload: jest.fn(),
      setData: spyUpdate
    });

    useApiPut.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .mutate('put', useApiPut, null, spyMerge);

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(result.current).toEqual(expect.objectContaining({
      put: expect.any(Function),
    }));

    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiPut).toHaveBeenCalledWith('/api/test');

    // Call send
    let prom: ApiPromise<ApiResponse<string>>;
    act(() => {
      prom = result.current.put(1);
    });

    expect(spySend).toHaveBeenCalledWith(1, undefined);

    // After receive
    await act(async () => {
      respond('updated');

      await expect(prom).resolves.toEqual({
        status: 200,
        headers: {},
        data: 'updated'
      });
    });

    expect(spyUpdate).toHaveBeenCalledWith(expect.any(Function));

    // Check updator
    const updator = spyUpdate.mock.calls[0][0];

    expect(updator('test')).toBeUndefined();
    expect(spyMerge).toHaveBeenCalledWith('test', 'updated');
  });

  it('should call useApiPut with new url', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [number, string]>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), jest.fn()));

    useApiPut.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .mutate('put', useApiPut, '/api/test/put', jest.fn());

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiPut).toHaveBeenCalledWith('/api/test');

    // Call send
    act(() => {
      result.current.put(1);
    });

    expect(spySend).toHaveBeenCalledWith(1, '/api/test/put');
  });

  it('should call useApiPut with built url', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResponse<string>>, [number, string]>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), jest.fn()));

    useApiPut.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useApiTest = apiResource<string>(useApiGet, '/api/test')
      .mutate('put', useApiPut, (id: number) => `/api/test/${id}/put`, jest.fn());

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(useApiAutoLoad).toHaveBeenCalledWith(useApiGet, '/api/test');
    expect(useApiPut).toHaveBeenCalledWith('/api/test');

    // Call send
    act(() => {
      result.current.put(2, 1);
    });

    expect(spySend).toHaveBeenCalledWith(2, '/api/test/1/put');
  });
});