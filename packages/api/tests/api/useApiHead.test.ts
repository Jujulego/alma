import { act, renderHook } from '@testing-library/react-hooks';

import { ApiPromise, ApiRequest, ApiResponse, useApiHead, useApiRequest as _useApiRequest } from '../../src';

// Mocks
jest.mock('../../src/api/useApiRequest');
const useApiRequest = _useApiRequest as jest.MockedFunction<typeof _useApiRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useApiHead', () => {
  // Tests
  it('should call useApiRequest and generate a head request', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<'text'>>, [ApiRequest<'head', 'json'>]>()
      .mockResolvedValue({ status: 200, headers: {}, data: 'test' });

    useApiRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useApiHead<string>('/api/test'));

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
      method: 'head',
      url: '/api/test',
      headers: {},
      responseType: 'json'
    });
  });
});
