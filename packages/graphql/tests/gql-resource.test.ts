import { ApiPromise, makeApiPromise } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';

import {
  buildRequest as _buildRequest, GqlCancel, gqlDoc as _gqlDoc,
  gqlResource, GqlResponse, GqlSink, GqlVariables,
  useGqlAutoLoad as _useGqlAutoLoad,
  useGqlHttp as _useGqlHttp,
  useGqlWs as _useGqlWs
} from '../src';

// Mocks
jest.mock('../src/gql/useGqlAutoLoad');
const useGqlAutoLoad = _useGqlAutoLoad as jest.MockedFunction<typeof _useGqlAutoLoad>;

jest.mock('../src/gql/useGqlHttp');
const useGqlHttp = _useGqlHttp as jest.MockedFunction<typeof _useGqlHttp>;

jest.mock('../src/gql/useGqlWs');
const useGqlWs = _useGqlWs as jest.MockedFunction<typeof _useGqlWs>;

jest.mock('../src/utils');
const buildRequest = _buildRequest as jest.MockedFunction<typeof _buildRequest>;
const gqlDoc = _gqlDoc as jest.MockedFunction<typeof _gqlDoc>;

// Setup
beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  useGqlHttp.mockReturnValue({
    loading: false,
    send: jest.fn()
  });

  useGqlWs.mockReturnValue({
    loading: false,
    send: jest.fn(),
    subscribe: jest.fn()
  });

  useGqlAutoLoad.mockReturnValue({
    loading: false,
    data: 'test',
    reload: jest.fn(),
    setData: jest.fn()
  });

  buildRequest.mockReturnValue({
    operationName: 'operationName',
    query: 'query',
  });

  gqlDoc.mockImplementation((doc) => doc);
});

// Test suites
describe('gqlResource', () => {
  // Tests
  it('should call useGqlAutoLoad with given url, document and hook and return result', () => {
    // Render
    const useGqlTest = gqlResource(useGqlHttp, '/api/graphql', gqlDoc<string>('document'));
    const { result } = renderHook(() => useGqlTest({ test: 5 }));

    // Check
    expect(result.current).toEqual({
      loading: false,
      data: 'test',
      reload: expect.any(Function),
      setData: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document');
    expect(useGqlAutoLoad).toHaveBeenCalledWith(useGqlHttp, '/api/graphql', { operationName: 'operationName', query: 'query' }, { test: 5 });
  });
});

describe('gqlResource.query', () => {
  // Tests
  it('should call useGqlHttp with same url, given document and return result', async () => {
    // Mocks
    let respond: (data: string) => void = () => undefined;
    const spySend = jest.fn<ApiPromise<GqlResponse<string>>, [GqlVariables]>()
      .mockReturnValue(makeApiPromise(new Promise((resolve) => {
        respond = (data) => resolve({ data });
      }), jest.fn()));

    const spyMerge = jest.fn();
    const spyUpdate = jest.fn();

    useGqlAutoLoad.mockReturnValue({
      loading: false,
      data: 'test',
      reload: jest.fn(),
      setData: spyUpdate
    });

    useGqlHttp.mockReturnValue({ loading: false, send: spySend });

    // Render
    const useGqlTest = gqlResource(useGqlHttp, '/api/graphql', gqlDoc<string>('document'))
      .query('getMore', useGqlHttp, gqlDoc<string>('getMore document'), spyMerge);

    const { result } = renderHook(() => useGqlTest({ test: 5 }));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({
      getMore: expect.any(Function),
    }));

    expect(buildRequest).toHaveBeenCalledWith('document');
    expect(useGqlAutoLoad).toHaveBeenCalledWith(useGqlHttp, '/api/graphql', { operationName: 'operationName', query: 'query' }, { test: 5 });

    expect(buildRequest).toHaveBeenCalledWith('getMore document');
    expect(useGqlHttp).toHaveBeenCalledWith('/api/graphql', { operationName: 'operationName', query: 'query' });

    // Call send
    let prom: ApiPromise<GqlResponse<string>>;
    act(() => {
      prom = result.current.getMore({ more: 'a lot' });
    });

    expect(spySend).toHaveBeenCalledWith({ more: 'a lot' });

    // After receive
    await act(async () => {
      respond('more');

      await expect(prom).resolves.toEqual({
        data: 'more'
      });
    });

    expect(spyUpdate).toHaveBeenCalledWith(expect.any(Function));

    // Check updator
    const updator = spyUpdate.mock.calls[0][0];

    expect(updator('test')).toBeUndefined();
    expect(spyMerge).toHaveBeenCalledWith('test', 'more');
  });
});

describe('gqlResource.subscribe', () => {
  // Tests
  it('should call useGqlWs with same url, given document and return result', () => {
    // Mocks
    const spySubscribe = jest.fn<GqlCancel, [GqlVariables, GqlSink<string>]>()
      .mockReturnValue(() => undefined);

    const spyMerge = jest.fn();
    const spyUpdate = jest.fn();

    useGqlAutoLoad.mockReturnValue({
      loading: false,
      data: 'test',
      reload: jest.fn(),
      setData: spyUpdate
    });

    useGqlWs.mockReturnValue({ loading: false, send: jest.fn(), subscribe: spySubscribe });

    // Render
    const useGqlTest = gqlResource(useGqlHttp, '/api/graphql', gqlDoc<string>('document'))
      .subscribe('events', useGqlWs, gqlDoc<string>('events document'), spyMerge);

    const { result } = renderHook(() => useGqlTest({ test: 5 }));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({
      events: expect.any(Function),
    }));

    expect(buildRequest).toHaveBeenCalledWith('document');
    expect(useGqlAutoLoad).toHaveBeenCalledWith(useGqlHttp, '/api/graphql', { operationName: 'operationName', query: 'query' }, { test: 5 });

    expect(buildRequest).toHaveBeenCalledWith('events document');
    expect(useGqlWs).toHaveBeenCalledWith('/api/graphql', { operationName: 'operationName', query: 'query' });

    // Call send
    const spyOnData = jest.fn();
    const spyOnError = jest.fn();

    act(() => {
      result.current.events({ event: 'update' }, { onData: spyOnData, onError: spyOnError });
    });

    expect(spySubscribe).toHaveBeenCalledWith({ event: 'update' }, {
      onData: expect.any(Function),
      onError: expect.any(Function)
    });

    // After receive
    const { onData, onError } = spySubscribe.mock.calls[0][1];

    act(() => {
      onData({ data: 'more' });
    });

    expect(spyOnData).toHaveBeenCalledWith({ data: 'more' });
    expect(spyUpdate).toHaveBeenCalledWith(expect.any(Function));

    // Check updator
    const updator = spyUpdate.mock.calls[0][0];

    expect(updator('test')).toBeUndefined();
    expect(spyMerge).toHaveBeenCalledWith('test', 'more');

    // On error
    act(() => {
      onError(new Error('failed !'));
    });

    expect(spyOnError).toHaveBeenCalledWith(new Error('failed !'));
  });
});
