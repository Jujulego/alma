import { ApiPromise, makeApiPromise, Updator, useSwrCache as _useSwrCache } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import { useState } from 'react';

import { buildRequest as _buildRequest, GqlResponse, useGqlAutoLoad, useGqlHttp as _useGqlHttp } from '../../src';

// Mocks
jest.mock('@jujulego/alma-api/dist/cjs/cache');
const useSwrCache = _useSwrCache as jest.MockedFunction<typeof _useSwrCache>;

jest.mock('../../src/gql/useGqlHttp');
const useGqlHttp = _useGqlHttp as jest.MockedFunction<typeof _useGqlHttp>;

jest.mock('../../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useSwrCache.mockImplementation((id, initial) => {
    const [data, setData] = useState(initial);
    return { data, setData };
  });

  useGqlHttp.mockReturnValue({
    loading: false,
    send: jest.fn()
  });

  buildRequest.mockReturnValue({
    operationName: 'operationName',
    query: 'query',
  });
});

// Test suites
describe('useGqlAutoLoad', () => {
  // Tests
  it('should send gql request and return result', async () => {
    // Mocks
    const spySetData = jest.fn<void, [GqlResponse<string> | undefined]>();

    useSwrCache.mockImplementation((id, initial) => {
      const [data, setData] = useState(initial);
      spySetData.mockImplementation(setData);

      return { data, setData: spySetData };
    });

    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, []>()
      .mockResolvedValue({
        data: 'success',
        errors: []
      });

    useGqlHttp.mockReturnValue({ loading: true, send: spySend });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useGqlAutoLoad(useGqlHttp, '/api/graphql', 'document', { test: 5 }));

    expect(useSwrCache).toHaveBeenCalledWith('gql:operationName', undefined, false);
    expect(useGqlHttp).toHaveBeenCalledWith('/api/graphql', { operationName: 'operationName', query: 'query' });
    expect(result.current).toEqual({
      loading: true,
      reload: expect.any(Function),
      setData: expect.any(Function)
    });

    // After receive
    await waitForNextUpdate();

    expect(spySetData).toHaveBeenCalledWith({ data: 'success', errors: [] });
    expect(spySend).toHaveBeenCalledWith({ test: 5 });
    expect(result.current).toEqual(expect.objectContaining({
      data: 'success',
      errors: [],
    }));
  });

  it('should not send gql request', () => {
    // Mocks
    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, []>()
      .mockResolvedValue({
        data: 'success',
        errors: []
      });

    useGqlHttp.mockReturnValue({ loading: true, send: spySend });

    // Render
    renderHook(() => useGqlAutoLoad(useGqlHttp, '/api/graphql', 'document', { test: 5 }, { load: false }));

    expect(spySend).not.toHaveBeenCalled();
  });

  it('should re-send gql request', () => {
    // Mocks
    const spyCancel = jest.fn();
    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, []>()
      .mockReturnValue(makeApiPromise(new Promise(() => undefined), spyCancel));

    useGqlHttp.mockReturnValue({ loading: true, send: spySend });

    // Render
    const { result } = renderHook(() => useGqlAutoLoad(useGqlHttp, '/api/graphql', 'document', { test: 5 }));

    // After receive
    expect(spySend).toHaveBeenCalledTimes(1);

    // Request reload
    act(() => result.current.reload());

    expect(spySend).toHaveBeenCalledTimes(2);
    expect(spyCancel).toHaveBeenCalledTimes(1);
  });

  it('should not cache request without operationName', async () => {
    // Mocks
    jest.spyOn(console, 'warn').mockImplementation();

    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, []>()
      .mockResolvedValue({
        data: 'success',
        errors: []
      });

    useGqlHttp.mockReturnValue({ loading: true, send: spySend });

    buildRequest.mockReturnValue({
      query: 'query',
    });

    // Render
    const { waitForNextUpdate } = renderHook(() => useGqlAutoLoad(useGqlHttp, '/api/graphql', 'document', { test: 5 }));
    expect(useSwrCache).toHaveBeenCalledWith('gql:undefined', undefined, true);
    expect(console.warn).toHaveBeenCalled();

    await waitForNextUpdate();
  });

  it('should update stored value', async () => {
    // Mocks
    const spySetData = jest.fn<void, [Updator<GqlResponse<string> | undefined>]>();

    useSwrCache.mockImplementation((id, initial) => {
      const [data, setData] = useState(initial);
      spySetData.mockImplementation(setData);

      return { data, setData: spySetData };
    });

    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, []>()
      .mockResolvedValue({
        data: 'success',
        errors: []
      });

    useGqlHttp.mockReturnValue({ loading: true, send: spySend });

    // Render
    const { result, waitForNextUpdate } = renderHook(() => useGqlAutoLoad(useGqlHttp, '/api/graphql', 'document', { test: 5 }));
    await waitForNextUpdate();

    expect(spySetData).toHaveBeenCalledTimes(1);

    // Update stored value
    act(() => result.current.setData('updated'));

    expect(spySetData).toHaveBeenCalledWith(expect.any(Function));
    expect(spySetData).toHaveBeenCalledTimes(2);

    const updator = spySetData.mock.calls[1][0];
    expect(updator({ data: 'success', errors: [] })).toEqual({ data: 'updated', errors: [] });
    expect(updator(undefined)).toEqual({ data: 'updated' });
  });
});