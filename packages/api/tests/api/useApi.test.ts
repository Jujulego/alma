import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import {
  ApiParams, ApiPromise, useApi,
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
        cached: false,
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
        cached: false,
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
      await expect(generator(axios.CancelToken.source()))
        .resolves.toEqual({ data: 'test' });

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken)
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
    const spySend = jest.fn<ApiPromise<string>, [ApiParams]>()
      .mockResolvedValue('test');

    useDeleteRequest.mockReturnValue({
      loading: false,
      cached: false,
      data: 'test',
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
        .resolves.toEqual('test');
    });

    expect(spySend).toHaveBeenCalledWith({ test: 'a' });

    // Test generator
    const generator = useDeleteRequest.mock.calls[0][0];
    await expect(generator(axios.CancelToken.source(), { test: 'a' }))
      .resolves.toEqual({ data: 'test' });

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(axios.delete).toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken),
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
      const spySend = jest.fn<ApiPromise<string>, [string, ApiParams]>()
        .mockResolvedValue('test');

      usePostRequest.mockReturnValue({
        loading: false,
        cached: false,
        data: 'test',
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
          .resolves.toEqual('test');
      });

      expect(spySend).toHaveBeenCalledWith('body', { test: 'a' });

      // Test generator
      const generator = usePostRequest.mock.calls[0][0];
      await expect(generator('body', axios.CancelToken.source(), { test: 'a' }))
        .resolves.toEqual({ data: 'test' });

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', 'body', {
        cancelToken: expect.any(axios.CancelToken),
        params: { test: 'a' },
      });
    });
  });
}