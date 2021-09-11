import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useAPI } from '../src/useApi';

// Setup
beforeEach(() => {
  jest.restoreAllMocks();
});

// Test suites
describe('useApi.get', () => {
  // Tests
  it('should print test', async () => {
    // Mocks
    jest.spyOn(axios, 'get').mockResolvedValue({ data: 'test' });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useAPI.get<string>('/api/test'));
    await waitForNextUpdate();

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ data: 'test' }));

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/test', {
      cancelToken: expect.any(axios.CancelToken)
    });
  });
});
