import { ApiPromise } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import gql from 'graphql-tag';

import { buildRequest as _buildRequest, useGqlMutation, useMutationRequest as _useMutationRequest } from '../../src';
import { TestData } from '../types';

// Mocks
jest.mock('../../src/gql/useMutationRequest');
const useMutationRequest = _useMutationRequest as jest.MockedFunction<typeof _useMutationRequest>;

jest.mock('../../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
const req = gql`
    mutation Success($test: String!) {
        success(name: $test) {
            isSuccessful
        }
    }
`;

beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('useGqlMutation', () => {
  // Tests
  it('should send request using useMutationRequest and buildRequest', async () => {
    // Mocks
    const spy = jest.fn<ApiPromise<{ success: TestData }>, [{ name: string }]>()
      .mockResolvedValue({
        success: { isSuccessful: true }
      });

    useMutationRequest.mockReturnValue({
      loading: true,
      cached: false,
      send: spy,
    });

    buildRequest.mockReturnValue({
      operationName: 'Success',
      query: 'mutation Success { ... }'
    });

    // Render
    const { result } = renderHook(() => useGqlMutation<{ success: TestData }, { name: string }>('/graphql', req));

    // Check result
    expect(result.current).toEqual({
      loading: true,
      cached: false,
      send: expect.any(Function),
    });

    // Check buildRequest
    expect(buildRequest).toHaveBeenCalledTimes(1);
    expect(buildRequest).toHaveBeenCalledWith(req);

    // Check useMutationRequest
    expect(useMutationRequest).toHaveBeenCalledWith(
      '/graphql',
      { operationName: 'Success', query: 'mutation Success { ... }' },
      undefined
    );

    // Send request
    await act(async () => {
      await expect(result.current.send({ name: 'name' }))
        .resolves.toEqual({
          success: { isSuccessful: true }
        });
    });

    expect(spy).toHaveBeenCalledWith({ name: 'name' });
  });
});