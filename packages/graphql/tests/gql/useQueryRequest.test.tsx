import { Updator } from '@jujulego/alma-api';
import * as almaApi from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import axios from 'axios';

import { useQueryRequest } from '../../src';
import { TestData } from '../types';
import { GqlResponse } from '../../dist/types/types';

// Mocks
jest.mock('@jujulego/alma-api');
const { useGetRequest } = almaApi as jest.Mocked<typeof almaApi>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useQueryRequest', () => {
  // Tests
  it('should send request using axios post and useGetRequest', async () => {
    // Mocks
    jest.spyOn(axios, 'post').mockResolvedValue({
      data: {
        test: { isSuccessful: true }
      }
    });

    useGetRequest.mockReturnValue({
      loading: true,
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Check useGetRequest call
    expect(useGetRequest).toHaveBeenCalledWith(
      expect.any(Function),
      'graphql:/graphql:Test',
      { disableSwr: false, load: undefined }
    );

    // Check generator
    const generator = useGetRequest.mock.calls[0][0];

    await expect(generator(axios.CancelToken.source()))
      .resolves.toEqual({
        data: {
          test: { isSuccessful: true }
        }
      });

    expect(axios.post).toHaveBeenCalledWith('/graphql', {
      query: 'query',
      operationName: 'Test',
      variables: { name: 'name' }
    }, { cancelToken: expect.any(axios.CancelToken) });
  });

  it('should not cache request without operation name', () => {
    // Mocks
    useGetRequest.mockReturnValue({
      loading: true,
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
    }, { name: 'name' }));

    // Check useGetRequest call
    expect(useGetRequest).toHaveBeenCalledWith(
      expect.any(Function),
      'graphql:/graphql:',
      { disableSwr: true, load: undefined }
    );
  });

  it('should call useGetRequest and return it\'s state', () => {
    // Mocks
    useGetRequest.mockReturnValue({
      loading: true,
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Checks
    expect(result.current).toEqual({
      loading: true,
      reload: expect.any(Function),
      update: expect.any(Function)
    });
  });

  it('should return api call result', () => {
    // Mocks
    useGetRequest.mockReturnValue({
      loading: false,
      data: {
        data: { test: { isSuccessful: true } }
      },
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      data: {
        test: { isSuccessful: true }
      },
      reload: expect.any(Function),
      update: expect.any(Function)
    });
  });

  it('should return api call error (request succeed)', () => {
    // Mocks
    useGetRequest.mockReturnValue({
      loading: false,
      data: {
        errors: [
          {
            message: 'Error in test',
            location: { column: 1, line: 1 }
          }
        ]
      },
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      error: {
        errors: [
          {
            message: 'Error in test',
            location: { column: 1, line: 1 }
          }
        ]
      },
      reload: expect.any(Function),
      update: expect.any(Function)
    });
  });

  it('should return api call error (request failed)', () => {
    // Mocks
    useGetRequest.mockReturnValue({
      loading: false,
      error: {
        errors: [
          {
            message: 'Error in test',
            location: { column: 1, line: 1 }
          }
        ]
      },
      update: jest.fn(),
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      error: {
        errors: [
          {
            message: 'Error in test',
            location: { column: 1, line: 1 }
          }
        ]
      },
      reload: expect.any(Function),
      update: expect.any(Function)
    });
  });

  it('should update state (value)', () => {
    // Mocks
    const spy = jest.fn<void, [Updator<GqlResponse<{ test: TestData }>>]>();
    useGetRequest.mockReturnValue({
      loading: false,
      data: {
        data: { test: { isSuccessful: true } }
      },
      update: spy,
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Check update
    act(() => {
      result.current.update({ test: { isSuccessful: false } });
    });

    expect(spy).toHaveBeenCalledWith(expect.any(Function));

    // Check given updator
    const updator = spy.mock.calls[0][0];

    expect(updator({ data: { test: { isSuccessful: true }}}))
      .toEqual({ data: { test: { isSuccessful: false }}});

    expect(updator(undefined))
      .toEqual({ data: { test: { isSuccessful: false }}});
  });

  it('should update state (updator)', () => {
    // Mocks
    const spy = jest.fn<void, [Updator<GqlResponse<{ test: TestData }>>]>();
    useGetRequest.mockReturnValue({
      loading: false,
      data: {
        data: { test: { isSuccessful: true } }
      },
      update: spy,
      reload: jest.fn(),
    });

    // Render
    const { result } = renderHook(() => useQueryRequest<{ test: TestData }, { name: string }>('/graphql', {
      query: 'query',
      operationName: 'Test'
    }, { name: 'name' }));

    // Check update
    act(() => {
      result.current.update((old) => ({ test: { isSuccessful: !(old?.test?.isSuccessful) } }));
    });

    expect(spy).toHaveBeenCalledWith(expect.any(Function));

    // Check given updator
    const updator = spy.mock.calls[0][0];

    expect(updator({ data: { test: { isSuccessful: true }}}))
      .toEqual({ data: { test: { isSuccessful: false }}});

    expect(updator(undefined))
      .toEqual({ data: { test: { isSuccessful: true }}});
  });
});