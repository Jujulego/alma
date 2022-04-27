import { ApiPromise } from '@jujulego/alma-api';
import { act, renderHook } from '@testing-library/react-hooks';
import { FC, ReactNode } from 'react';

import {
  buildRequest as _buildRequest,
  GqlCancel,
  GqlResponse,
  GqlSink,
  GqlWsClientContext,
  useGqlWs
} from '../../src';

// Mocks
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
describe('useGqlWs.send', () => {
  it('should warn if GqlWsClientContext not found', () => {
    // Mocks
    jest.spyOn(console, 'warn').mockImplementation();

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call send
    act(() => {
      expect(result.current.send({ test: 5 })).toBeInstanceOf(Promise);
    });

    expect(result.current.loading).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should use GqlWsClientContext to send given request', async () => {
    // Mocks
    const spyUnsubscribe = jest.fn();
    const spySubscribe = jest.fn()
      .mockReturnValue(spyUnsubscribe);

    const wrapper: FC<{ children?: ReactNode }> = ({ children }) => (
      <GqlWsClientContext.Provider value={{
        client: {
          on: () => () => undefined,
          subscribe: spySubscribe,
          dispose: () => undefined
        }
      }}>
        { children }
      </GqlWsClientContext.Provider>
    );

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'), { wrapper });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call send
    let prom: ApiPromise<GqlResponse<string>>;

    act(() => {
      prom = result.current.send({ test: 5 });
    });

    expect(result.current.loading).toBe(true);
    expect(spySubscribe).toHaveBeenCalledWith({
      operationName: 'operationName',
      query: 'query',
      variables: { test: 5 }
    }, {
      next: expect.any(Function),
      complete: expect.any(Function),
      error: expect.any(Function),
    });

    const { next, complete } = spySubscribe.mock.calls[0][1];

    // Resolve on next
    await act(async () => {
      next({ data: 'result', errors: [] });
      await expect(prom).resolves.toEqual({
        data: 'result',
        errors: []
      });
    });

    expect(spyUnsubscribe).not.toHaveBeenCalled();

    // Reset loading on complete
    act(() => {
      complete();
    });

    expect(result.current.loading).toBe(false);
    expect(spyUnsubscribe).not.toHaveBeenCalled();

    // Calling cancel should call unsubscribe
    act(() => {
      prom.cancel();
    });

    expect(spyUnsubscribe).toHaveBeenCalled();
  });

  it('should reject if error while sending request', async () => {
    // Mocks
    const spySubscribe = jest.fn()
      .mockReturnValue(() => undefined);

    const wrapper: FC<{ children?: ReactNode }> = ({ children }) => (
      <GqlWsClientContext.Provider value={{
        client: {
          on: () => () => undefined,
          subscribe: spySubscribe,
          dispose: () => undefined
        }
      }}>
        { children }
      </GqlWsClientContext.Provider>
    );

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'), { wrapper });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call send
    let prom: ApiPromise<GqlResponse<string>>;

    act(() => {
      prom = result.current.send({ test: 5 });
    });

    expect(result.current.loading).toBe(true);
    expect(spySubscribe).toHaveBeenCalledWith({
      operationName: 'operationName',
      query: 'query',
      variables: { test: 5 }
    }, {
      next: expect.any(Function),
      complete: expect.any(Function),
      error: expect.any(Function),
    });

    const { error } = spySubscribe.mock.calls[0][1];

    // Rejects on error
    await act(async () => {
      error(new Error('Test failed !'));
      await expect(prom).rejects.toEqual(new Error('Test failed !'));
    });

    expect(result.current.loading).toBe(false);
  });
});

describe('useGqlWs.subscribe', () => {
  it('should warn if GqlWsClientContext not found', () => {
    // Mocks
    jest.spyOn(console, 'warn').mockImplementation();

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'));

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call send
    const sink: GqlSink<string> = {
      onData: jest.fn(),
      onError: jest.fn()
    };

    act(() => {
      expect(result.current.subscribe({ test: 5 }, sink)).toBeInstanceOf(Function);
    });

    expect(result.current.loading).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should use GqlWsClientContext to send given subscription', () => {
    // Mocks
    const spyUnsubscribe = jest.fn();
    const spySubscribe = jest.fn()
      .mockReturnValue(spyUnsubscribe);

    const wrapper: FC<{ children?: ReactNode }> = ({ children }) => (
      <GqlWsClientContext.Provider value={{
        client: {
          on: () => () => undefined,
          subscribe: spySubscribe,
          dispose: () => undefined
        }
      }}>
        { children }
      </GqlWsClientContext.Provider>
    );

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'), { wrapper });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call subscribe
    let cancel: GqlCancel;
    const sink: GqlSink<string> = {
      onData: jest.fn(),
      onError: jest.fn()
    };

    act(() => {
      cancel = result.current.subscribe({ test: 5 }, sink);
    });

    expect(result.current.loading).toBe(true);
    expect(spySubscribe).toHaveBeenCalledWith({
      operationName: 'operationName',
      query: 'query',
      variables: { test: 5 }
    }, {
      next: expect.any(Function),
      complete: expect.any(Function),
      error: expect.any(Function),
    });

    const { next, complete } = spySubscribe.mock.calls[0][1];

    // Call sink's onData on next
    act(() => {
      next({ data: 'result', errors: [] });
    });

    expect(sink.onData).toHaveBeenCalledWith({ data: 'result', errors: [] });

    // Reset loading on complete
    act(() => {
      complete();
    });

    expect(result.current.loading).toBe(false);
    expect(spyUnsubscribe).not.toHaveBeenCalled();

    // Calling cancel should call unsubscribe
    act(() => {
      cancel();
    });

    expect(spyUnsubscribe).toHaveBeenCalled();
  });

  it('should call sink\'s onError if error while subscribing', () => {
    // Mocks
    const spySubscribe = jest.fn()
      .mockReturnValue(() => undefined);

    const wrapper: FC<{ children?: ReactNode }> = ({ children }) => (
      <GqlWsClientContext.Provider value={{
        client: {
          on: () => () => undefined,
          subscribe: spySubscribe,
          dispose: () => undefined
        }
      }}>
        { children }
      </GqlWsClientContext.Provider>
    );

    // Render
    const { result } = renderHook(() => useGqlWs<string>('/api/graphql', 'document !'), { wrapper });

    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function),
      subscribe: expect.any(Function),
    });

    expect(buildRequest).toHaveBeenCalledWith('document !');

    // Call subscribe
    const sink: GqlSink<string> = {
      onData: jest.fn(),
      onError: jest.fn()
    };

    act(() => {
      result.current.subscribe({ test: 5 }, sink);
    });

    expect(result.current.loading).toBe(true);
    expect(spySubscribe).toHaveBeenCalledWith({
      operationName: 'operationName',
      query: 'query',
      variables: { test: 5 }
    }, {
      next: expect.any(Function),
      complete: expect.any(Function),
      error: expect.any(Function),
    });

    // Call onError
    const { error } = spySubscribe.mock.calls[0][1];

    act(() => {
      error(new Error('Test failed !'));
    });

    expect(result.current.loading).toBe(false);
    expect(sink.onError).toHaveBeenCalledWith(new Error('Test failed !'));
  });
});
