import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useAPI } from '../src';

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
  });
}