import { renderHook } from '@testing-library/react-hooks';
import gql from 'graphql-tag';

import { useGqlQuery, useQueryRequest as _useQueryRequest } from '../../src';
import { buildRequest as _buildRequest } from '../../src/utils';

// Mocks
jest.mock('../../src/gql/useQueryRequest');
const useQueryRequest = _useQueryRequest as jest.MockedFunction<typeof _useQueryRequest>;

jest.mock('../../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
const req = gql`
    query Test($name: String!) {
        test(name: $name) {
            isSuccessful
        }
    }
`;

beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useQueryRequest.mockReturnValue({
    loading: true,
    update: jest.fn(),
    reload: jest.fn(),
  });
});

// Tests
describe('useGqlQuery', () => {
  // Tests
  it('should send request using useQueryRequest and build request', () => {
    // Mocks
    buildRequest.mockReturnValue({
      operationName: 'Test',
      query: 'query Test { ... }'
    });

    // Render
    const { result } = renderHook(() => useGqlQuery('/graphql', req, { name: 'name' }));

    // Check result
    expect(result.current).toEqual({
      loading: true,
      update: expect.any(Function),
      reload: expect.any(Function),
    });

    // Check buildRequest
    expect(buildRequest).toHaveBeenCalledTimes(1);
    expect(buildRequest).toHaveBeenCalledWith(req);

    // Check useQueryRequest
    expect(useQueryRequest).toHaveBeenCalledWith(
      '/graphql',
      { operationName: 'Test', query: 'query Test { ... }' },
      { name: 'name' },
      undefined
    );
  });

  it('should warn on request without operationName', () => {
    // Mocks
    buildRequest.mockReturnValue({
      query: 'query { ... }'
    });

    jest.spyOn(console, 'warn')
      .mockImplementation();

    // Render
    renderHook(() => useGqlQuery('/graphql', req, { name: 'name' }));

    // Check
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('No operation name found in document, result will not be cached');
  });
});