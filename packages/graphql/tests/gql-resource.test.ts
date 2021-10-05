import { renderHook } from '@testing-library/react-hooks';
import gql from 'graphql-tag';

import { gqlResource, useQueryRequest as _useQueryRequest } from '../src';
import { buildRequest as _buildRequest } from '../src/utils';
import { TestData } from './types';

// Mocks
jest.mock('../src/gql/useQueryRequest');
const useQueryRequest = _useQueryRequest as jest.MockedFunction<typeof _useQueryRequest>;

jest.mock('../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
const req = gql`
    query Test {
        test {
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

// Test suites
describe('gqlResource', () => {
  // Tests
  it('should send request using useQueryRequest and build request', () => {
    // Mocks
    buildRequest.mockReturnValue({
      operationName: 'Test',
      query: 'query Test { ... }'
    });

    // Build query
    const useGqlTest = gqlResource<TestData, { name: string }>('/graphql', req);

    // Check buildRequest
    expect(buildRequest).toHaveBeenCalledTimes(1);
    expect(buildRequest).toHaveBeenCalledWith(req);

    // Render
    const { result } = renderHook(() => useGqlTest({ name: 'name' }));

    // Check result
    expect(result.current).toEqual({
      loading: true,
      update: expect.any(Function),
      reload: expect.any(Function),
    });

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

    // Build query
    gqlResource<TestData, { name: string }>('/graphql', req);

    // Check
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('No operation name found in document, result will not be cached');
  });
});