import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useAPI } from '../src/useApi';

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
      const { result, waitForNextUpdate } = renderHook(() => useAPI[method]<string>('/api/test'));

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

    it('should reload data', async () => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      // Render
      const { result, waitForNextUpdate } = renderHook(() => useAPI[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

      // After receive
      await waitForNextUpdate();
      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

      // After reload
      act(() => {
        result.current.reload();
      });

      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: true }));

      // After receive
      await waitForNextUpdate();
      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

      expect(axios[method]).toHaveBeenCalledTimes(2);
    });

    it('should not load api call', () => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      // Render
      const { result } = renderHook(() => useAPI[method]<string>('/api/test', {}, { load: false }));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

      expect(axios[method]).not.toHaveBeenCalledWith('/api/test', {
        cancelToken: expect.any(axios.CancelToken)
      });
    });

    it('should update cached value', async () => {
      // Mocks
      jest.spyOn(axios, method).mockResolvedValue({ data: 'test' });

      // Render
      const { result, waitForNextUpdate } = renderHook(() => useAPI[method]<string>('/api/test'));

      // Checks
      expect(result.current).toEqual(expect.objectContaining({ data: undefined, loading: true }));

      // After receive
      await waitForNextUpdate();
      expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));

      // Update cached value
      act(() => {
        result.current.update('it\'s');
      });

      expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s', loading: false }));

      // Update cached value (with updator)
      act(() => {
        result.current.update((old) => `${old} working`);
      });

      expect(result.current).toEqual(expect.objectContaining({ data: 'it\'s working', loading: false }));
    });
  });
}