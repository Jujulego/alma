import { act, renderHook } from '@testing-library/react-hooks';

import { useApiPut } from '../../src/api/useApiPut';
import { useApiRequest as _useApiRequest } from '../../src/api/useApiRequest';
import { ApiPromise } from '../../src/api-promise';
import { ApiRequest, ApiResponse } from '../../src/types';

// Mocks
jest.mock('../../src/api/useApiRequest');
const useApiRequest = _useApiRequest as jest.MockedFunction<typeof _useApiRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useApiPut', () => {
  // Tests
  it('should call useApiRequest and generate a put request', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<string>>, [ApiRequest<'put'>]>()
      .mockResolvedValue({ status: 200, headers: {}, data: 'test' });

    useApiRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useApiPut<number, string>('/api/test'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
    });

    expect(useApiRequest).toHaveBeenCalledTimes(1);

    // Call send
    await act(async () => {
      await expect(result.current.send(1))
        .resolves.toEqual({ status: 200, headers: {}, data: 'test' });
    });

    expect(spy).toHaveBeenCalledWith({
      method: 'put',
      url: '/api/test',
      headers: {},
      body: 1
    });
  });
});
