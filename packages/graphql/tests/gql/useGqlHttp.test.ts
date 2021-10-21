import { ApiPromise, ApiRequest, ApiResponse, useApiRequest as _useApiRequest } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';

import { buildRequest as _buildRequest, GqlRequest, GqlResponse, useGqlHttp } from '../../src';

// Mocks
jest.mock('@jujulego/alma-api');
const useApiRequest = _useApiRequest as jest.MockedFunction<typeof _useApiRequest>;

jest.mock('../../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  buildRequest.mockReturnValue({
    operationName: 'operationName',
    query: 'query',
  });
});

// Tests suites
describe('useGqlHttp', () => {
  it('should call useApiRequest and send given request', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<ApiResponse<GqlResponse<string>>>, [ApiRequest<'post', GqlRequest<string>>]>()
      .mockResolvedValue({ status: 200, headers: {}, data: { data: 'test' } });

    useApiRequest.mockReturnValue({
      loading: false,
      send: spy
    });

    // Render
    const { result } = renderHook(() => useGqlHttp('/api/graphql', 'document !'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    expect(useApiRequest).toHaveBeenCalled();

    // Call send
    await act(async () => {
      await expect(result.current.send({ test: 1 }))
        .resolves.toEqual({ data: 'test' });
    });

    expect(spy).toHaveBeenCalledWith({
      method: 'post',
      url: '/api/graphql',
      headers: {},
      body: {
        operationName: 'operationName',
        query: 'query',
        variables: { test: 1 }
      }
    });
  });
});