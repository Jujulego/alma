import { ApiPromise, Updator } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import gql from 'graphql-tag';

import {
  gqlResource,
  gqlVars,
  useMutationRequest as _useMutationRequest,
  useQueryRequest as _useQueryRequest
} from '../src';
import { buildRequest as _buildRequest } from '../src/utils';
import { TestData } from './types';

// Mocks
jest.mock('../src/gql/useQueryRequest');
const useQueryRequest = _useQueryRequest as jest.MockedFunction<typeof _useQueryRequest>;

jest.mock('../src/gql/useMutationRequest');
const useMutationRequest = _useMutationRequest as jest.MockedFunction<typeof _useMutationRequest>;

jest.mock('../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
const query = gql`
    query Test {
        test {
            isSuccessful
        }
    }
`;

const mutation = gql`
    mutation Success($test: String!) {
        success(name: $test) {
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
  it('should send request using useQueryRequest and buildRequest', () => {
    // Mocks
    buildRequest.mockReturnValue({
      operationName: 'Test',
      query: 'query Test { ... }'
    });

    // Build query
    const useGqlTest = gqlResource<TestData, { name: string }>('/graphql', query);

    // Check buildRequest
    expect(buildRequest).toHaveBeenCalledTimes(1);
    expect(buildRequest).toHaveBeenCalledWith(query);

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
    gqlResource<TestData, { name: string }>('/graphql', query);

    // Check
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('No operation name found in document, result will not be cached');
  });
});

describe('useGqlMutation', () => {
  // Tests
  it('should send request using useMutationRequest and buildRequest', async () => {
    // Mocks
    const spyUpdate = jest.fn<void, [Updator<{ test: TestData }>]>();

    useQueryRequest.mockReturnValue({
      loading: true,
      update: spyUpdate,
      reload: jest.fn(),
    });

    const spySend = jest.fn<ApiPromise<{ success: TestData }>, [{ name: string }]>()
      .mockResolvedValue({
        success: { isSuccessful: true }
      });

    useMutationRequest.mockReturnValue({
      loading: true,
      send: spySend,
    });

    buildRequest.mockReturnValue({
      operationName: 'Test',
      query: 'query Test { ... }'
    });

    const useGqlQTest = gqlResource<{ test: TestData }, { name: string }>('/graphql', query);

    buildRequest.mockReturnValue({
      operationName: 'Success',
      query: 'mutation Success { ... }'
    });

    // Build query
    const spyMerge = jest.fn<{ test: TestData }, [{ test: TestData } | undefined, { success: TestData }]>()
      .mockImplementation((old, res) => ({ test: res.success }));

    const useGqlMTest = useGqlQTest.mutation('success', mutation, spyMerge, gqlVars<{ name: string }>());

    // Check buildRequest
    expect(buildRequest).toHaveBeenCalledTimes(2);
    expect(buildRequest).toHaveBeenCalledWith(query);
    expect(buildRequest).toHaveBeenCalledWith(mutation);

    // Render
    const { result } = renderHook(() => useGqlMTest({ name: 'name' }));

    // Check result
    expect(result.current).toEqual({
      loading: true,
      update: expect.any(Function),
      reload: expect.any(Function),
      success: expect.any(Function),
    });

    // Check useMutationRequest
    expect(useMutationRequest).toHaveBeenCalledWith(
      '/graphql',
      { operationName: 'Success', query: 'mutation Success { ... }' },
      undefined
    );

    // Send request
    await act(async () => {
      await expect(result.current.success({ name: 'name' }))
        .resolves.toEqual({
          success: { isSuccessful: true }
        });
    });

    expect(spySend).toHaveBeenCalledWith({ name: 'name' });
    expect(spyUpdate).toHaveBeenCalledWith(expect.any(Function));

    // Check given updator
    const updator = spyUpdate.mock.calls[0][0];

    expect(updator({ test: { isSuccessful: false }}))
      .toEqual({ test: { isSuccessful: true }});

    expect(spyMerge).toHaveBeenCalledWith(
      { test: { isSuccessful: false }},
      { success: { isSuccessful: true } }
    );

    expect(updator(undefined))
      .toEqual({ test: { isSuccessful: true }});

    expect(spyMerge).toHaveBeenCalledWith(
      undefined,
      { success: { isSuccessful: true } }
    );
  });
});