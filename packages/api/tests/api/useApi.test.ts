import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useApi } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
type GetMethods = 'get' | 'head' | 'options';

for (const method of ['get', 'head', 'options'] as (GetMethods)[]) {
  describe(`useApi.${method}`, () => {
    // Tests
    it('should return api call result', async () => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      // Render
      const { result, waitForNextUpdate } = renderHook(() => useApi[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

      // After receive
      await waitForNextUpdate();
      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken)
      });
    });
  });
}

describe('useApi.delete', () => {
  // Tests
  it('should return api call result', async () => {
    // Mocks
    jest.spyOn(axios, 'delete').mockResolvedValue({ data: 'test' });

    // Render
    const { result } = renderHook(() => useApi.delete<string>('/api/test'));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ loading: false }));

    // After send
    await act(async () => {
      await expect(result.current.send({ test: 'a' }))
        .resolves.toEqual('test');
    });
    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(axios.delete).toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken),
      params: { test: 'a' },
    });
  });
});

type PostMethods = 'post' | 'put' | 'patch';

for (const method of ['post', 'put', 'patch'] as (PostMethods)[]) {
  describe(`useApi.${method}`, () => {
    // Tests
    it('should return api call result', async () => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      // Render
      const { result } = renderHook(() => useApi[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ loading: false }));

      // After send
      await act(async () => {
        await expect(result.current.send('body', { test: 'a' }))
          .resolves.toEqual('test');
      });
      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

      expect(axios[method]).toHaveBeenCalledTimes(1);
      expect(axios[method]).toHaveBeenCalledWith('/api/test', 'body', {
        cancelToken: expect.any(axios.CancelToken),
        params: { test: 'a' },
      });
    });
  });
}