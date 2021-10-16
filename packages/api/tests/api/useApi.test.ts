import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import {
  ApiParams, ApiPromise, ApiResult, useApi,
  useDeleteRequest as _useDeleteRequest,
  useGetRequest as _useGetRequest,
  usePostRequest as _usePostRequest
} from '../../src';
import { GET_METHODS, POST_METHODS } from '../utils';

// Mocks
jest.mock('../../src/api/useDeleteRequest');
const useDeleteRequest = _useDeleteRequest as jest.MockedFunction<typeof _useDeleteRequest>;

jest.mock('../../src/api/useGetRequest');
const useGetRequest = _useGetRequest as jest.MockedFunction<typeof _useGetRequest>;

jest.mock('../../src/api/usePostRequest');
const usePostRequest = _usePostRequest as jest.MockedFunction<typeof _usePostRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
for (const method of GET_METHODS) {
  describe(`useApi.${method}`, () => {
    beforeEach(() => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      useGetRequest.mockReturnValue({
        loading: false,
        status: 200,
        data: 'test',
        update: jest.fn(),
        reload: jest.fn(),
      });
    });

    // Tests
    it('should return api call result', async () => {
      // Render
      const { result } = renderHook(() => useApi[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual({
        loading: false,
        status: 200,
        data: 'test',
        update: expect.any(Function),
        reload: expect.any(Function),
      });

      // Check useGetRequest
      expect(useGetRequest).toHaveBeenCalledWith(
        expect.any(Function),
        `api-${method}:/api/test`,
        { load: undefined, disableSwr: undefined }
      );

      // Test generator
      const generator = useGetRequest.mock.calls[0][0];
      const abort = new AbortController();

      await expect(generator(abort.signal))
        .resolves.toEqual({ data: 'test' });

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', {
        signal: abort.signal
      });
    });
  });
}

describe('useApi.delete', () => {
  // Mocks
  beforeEach(() => {
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: 'test' });
  });

  // Tests
  it('should return api call result', async () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<ApiResult<string>>, [ApiParams]>()
      .mockResolvedValue({ status: 200, data: 'test' });

    useDeleteRequest.mockReturnValue({
      loading: false,
      send: spySend,
    });

    // Render
    const { result } = renderHook(() => useApi.delete<string>('/api/test'));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ loading: false }));

    // Check useDeleteRequest
    expect(useDeleteRequest).toHaveBeenCalledWith(expect.any(Function));

    // Test send
    await act(async () => {
      await expect(result.current.send({ test: 'a' }))
        .resolves.toEqual({ status: 200, data: 'test' });
    });

    expect(spySend).toHaveBeenCalledWith({ test: 'a' });

    // Test generator
    const generator = useDeleteRequest.mock.calls[0][0];
    const abort = new AbortController();

    await expect(generator(abort.signal, { test: 'a' }))
      .resolves.toEqual({ data: 'test' });

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(axios.delete).toHaveBeenCalledWith('/api/test', {
      signal: abort.signal,
      params: { test: 'a' },
    });
  });
});

for (const method of POST_METHODS) {
  describe(`useApi.${method}`, () => {
    // Mocks
    beforeEach(() => {
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });
    });

    // Tests
    it('should return api call result', async () => {
      // Mocks
      const spySend = jest.fn<ApiPromise<ApiResult<string>>, [string, ApiParams]>()
        .mockResolvedValue({ status: 200, data: 'test' });

      usePostRequest.mockReturnValue({
        loading: false,
        send: spySend,
      });

      // Render
      const { result } = renderHook(() => useApi[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ loading: false }));

      // Check usePostRequest
      expect(usePostRequest).toHaveBeenCalledWith(expect.any(Function));

      // After send
      await act(async () => {
        await expect(result.current.send('body', { test: 'a' }))
          .resolves.toEqual({ status: 200, data: 'test' });
      });

      expect(spySend).toHaveBeenCalledWith('body', { test: 'a' });

      // Test generator
      const generator = usePostRequest.mock.calls[0][0];
      const abort = new AbortController();

      await expect(generator('body', abort.signal, { test: 'a' }))
        .resolves.toEqual({ data: 'test' });

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', 'body', {
        signal: abort.signal,
        params: { test: 'a' },
      });
    });
  });
}