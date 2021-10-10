import { act, renderHook } from '@testing-library/react-hooks';

import { ApiPromise, apiResource, Updator, useApi as _useApi } from '../src';
import { POST_METHODS } from './utils';

jest.mock('../src/api/useApi');
const useApi = _useApi as jest.Mocked<typeof _useApi>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('apiResource', () => {
  // Mocks
  beforeEach(() => {
    useApi.get.mockReturnValue({
      loading: false,
      cached: false,
      data: 'test',
      reload: jest.fn(),
      update: jest.fn()
    });
  });

  // Tests
  it('should call useApi.get with given url and return results', () => {
    // Render
    const useApiTest = apiResource<string>('/api/test');
    const { result } = renderHook(() => useApiTest());

    // Check
    expect(result.current).toEqual({
      data: 'test',
      loading: false,
      reload: expect.any(Function),
      update: expect.any(Function),
    });

    expect(useApi.get).toHaveBeenCalledWith('/api/test');
  });

  it('should call useApi.get with built url', () => {
    // Render
    const useApiTest = apiResource<string, number>((n) => `/api/test/${n}`);
    renderHook(() => useApiTest(1));

    // Check
    expect(useApi.get).toHaveBeenCalledWith('/api/test/1');
  });
});

describe('apiResource.delete', () => {
  // Mocks
  let sendDelete: () => ApiPromise<string>;

  beforeEach(() => {
    useApi.get.mockReturnValue({
      loading: false,
      cached: false,
      data: 'test',
      reload: jest.fn(),
      update: jest.fn()
    });

    sendDelete = jest.fn().mockResolvedValue('done');
    useApi.delete.mockReturnValue({
      loading: false,
      cached: false,
      data: 'done',
      send: sendDelete
    });
  });

  // Tests
  it('should call useApi.delete with inherited url and send delete call', async () => {
    // Render
    const useApiTest = apiResource<string>('/api/test')
      .delete();

    const { result } = renderHook(() => useApiTest());

    // Check
    expect(result.current).toEqual(expect.objectContaining({
      remove: expect.any(Function),
    }));

    expect(useApi.delete).toHaveBeenCalledWith('/api/test');

    // Call delete
    await act(async () => {
      await expect(result.current.remove()).resolves.toEqual('done');
    });

    expect(sendDelete).toHaveBeenCalled();
  });

  it('should call useApi.delete with inherited built url', () => {
    // Render
    const useApiTest = apiResource<string, number>((n) => `/api/test/${n}`)
      .delete();

    renderHook(() => useApiTest(1));

    // Check
    expect(useApi.delete).toHaveBeenCalledWith('/api/test/1');
  });

  it('should call useApi.delete with given url', () => {
    // Render
    const useApiTest = apiResource<string>('/api/test')
      .delete('/api/test/delete');

    renderHook(() => useApiTest());

    // Check
    expect(useApi.delete).toHaveBeenCalledWith('/api/test/delete');
  });

  it('should call useApi.delete with built url', () => {
    // Render
    const useApiTest = apiResource<string>('/api/test')
      .delete<number>((n) => `/api/test/${n}`);

    renderHook(() => useApiTest(1));

    // Check
    expect(useApi.delete).toHaveBeenCalledWith('/api/test/1');
  });
});

for (const method of POST_METHODS) {
  describe(`apiResource.${method}`, () => {
    // Mocks
    let getUpdate: (upd: string | Updator<string>) => void;
    let sendPost: (body: string) => ApiPromise<string>;

    beforeEach(() => {
      getUpdate = jest.fn();
      useApi.get.mockReturnValue({
        loading: false,
        cached: false,
        data: 'test',
        reload: jest.fn(),
        update: getUpdate
      });

      sendPost = jest.fn().mockResolvedValue('done');
      useApi[method].mockReturnValue({
        loading: false,
        cached: false,
        data: 'done',
        send: sendPost
      });
    });

    // Tests
    it(`should call useApi.${method} with inherited url and send delete call`, async () => {
      // Render
      const useApiTest = apiResource<string>('/api/test')[method]<string>();

      const { result } = renderHook(() => useApiTest());

      // Check
      expect(result.current).toEqual(expect.objectContaining({
        [method]: expect.any(Function),
      }));

      expect(useApi[method]).toHaveBeenCalledWith('/api/test');

      // Call delete
      await act(async () => {
        await expect((result.current as any)[method]('body')).resolves.toEqual('done');
      });

      expect(getUpdate).toHaveBeenCalledWith('done');
      expect(sendPost).toHaveBeenCalled();
    });

    it('should call useApi.delete with inherited built url', () => {
      // Render
      const useApiTest = apiResource<string, number>((n) => `/api/test/${n}`)[method]();

      renderHook(() => useApiTest(1));

      // Check
      expect(useApi[method]).toHaveBeenCalledWith('/api/test/1');
    });

    it('should call useApi.delete with given url', () => {
      // Render
      const useApiTest = apiResource<string>('/api/test')[method]<string>('/api/test/delete');

      renderHook(() => useApiTest());

      // Check
      expect(useApi[method]).toHaveBeenCalledWith('/api/test/delete');
    });

    it('should call useApi.delete with built url', () => {
      // Render
      const useApiTest = apiResource<string>('/api/test')[method]<string, number>((n) => `/api/test/${n}`);

      renderHook(() => useApiTest(1));

      // Check
      expect(useApi[method]).toHaveBeenCalledWith('/api/test/1');
    });
  });
}