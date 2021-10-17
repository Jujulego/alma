import { act, renderHook } from '@testing-library/react-hooks';

import { useApiDelete } from '../../src/api/useApiDelete';
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
describe('useApiDelete', () => {
  // Tests
  it('should call useApiRequest and generate a delete request', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<string>>, [ApiRequest<'get'>]>()
      .mockResolvedValue({ status: 200, headers: {}, data: 'test' });

    useApiRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useApiDelete<string>('/api/test'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
    });

    expect(useApiRequest).toHaveBeenCalledTimes(1);

    // Call send
    await act(async () => {
      await expect(result.current.send())
        .resolves.toEqual({ status: 200, headers: {}, data: 'test' });
    });

    expect(spy).toHaveBeenCalledWith({
      method: 'delete',
      url: '/api/test',
      headers: {},
    });
  });
});
