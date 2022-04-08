import { act, renderHook } from '@testing-library/react-hooks';

import { ApiPromise, ApiRequest, ApiResponse, useApiPut, useApiRequest as _useApiRequest } from '../../../old';

// Mocks
jest.mock('../../../old/api/useApiRequest');
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
    const spy = jest.fn<ApiPromise<ApiResponse<'text'>>, [ApiRequest<'put', 'json'>]>()
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
      body: 1,
      responseType: 'json'
    });
  });
});
