import axios from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { useApiGet } from '../../src/api/useApiGet';
import { useApiRequest as _useApiRequest } from '../../src/api/useApiRequest';
import { ApiPromise } from '../../src/api-promise';
import { ApiRequest, ApiResponse } from '../../src/types';

// Mocks
jest.mock('../../src/api/useApiRequest');
const useApiRequest = _useApiRequest as jest.MockedFunction<typeof _useApiRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  jest.spyOn(axios, 'get').mockResolvedValue({
    status: 200,
    headers: {
      TEST: 'test'
    },
    data: 'success'
  });
});

// Test suites
describe('useApiGet', () => {
  // Tests
  it('should call useApiRequest and generate a get request', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<string>>, [ApiRequest<'get'>]>()
      .mockResolvedValue({ status: 200, headers: {}, data: 'test' });

    useApiRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useApiGet<string>('/api/test'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
    });

    expect(useApiRequest).toHaveBeenCalledWith(expect.any(Function));

    // Call send
    await act(async () => {
      await expect(result.current.send())
        .resolves.toEqual({ status: 200, headers: {}, data: 'test' });
    });

    expect(spy).toHaveBeenCalledWith({
      method: 'get',
      url: '/api/test',
      headers: {},
    });

    // Call generator
    const generator = useApiRequest.mock.calls[0][0];
    const abort = new AbortController();

    await expect(generator({ method: 'get', url: '/api/test', headers: {} }, abort.signal))
      .resolves.toEqual({
        status: 200,
        headers: {
          TEST: 'test'
        },
        data: 'success'
      });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/api/test', {
      signal: abort.signal,
      headers: {},
    });
  });
});
