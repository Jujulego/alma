import { AxiosResponse, CancelTokenSource } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { ApiPromise, useDeleteRequest } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useDeleteRequest', () => {
  // Tests
  it('should return api call result', async () => {
    // Render
    let resolve: (data: string) => void;
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockReturnValue(new Promise<AxiosResponse<string>>((res) => {
        resolve = (data) => res({
          status: 200,
          statusText: 'OK',
          data,
          headers: {},
          config: {}
        });
      }));

    const { result } = renderHook(() => useDeleteRequest(spy));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // After send
    let prom: ApiPromise<string>;
    act(() => {
      prom = result.current.send();
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      resolve('test');
      await expect(prom).resolves.toEqual('test');
    });

    expect(result.current).toEqual({
      loading: false,
      status: 200,
      data: 'test',
      send: expect.any(Function)
    });
  });

  it('should return api call error', async () => {
    // Render
    let reject: () => void;
    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockReturnValue(new Promise<AxiosResponse<string>>((_, rej) => {
        reject = () => rej({
          isAxiosError: true,
            response: {
            status: 400,
            statusText: 'Bad Request',
            data: 'Bad Request',
            headers: {},
            config: {}
          }
        });
      }));

    const { result } = renderHook(() => useDeleteRequest(spy));

    // Checks
    expect(result.current).toEqual({
      loading: false,
      send: expect.any(Function)
    });

    // After send
    let prom: ApiPromise<string>;
    act(() => {
      prom = result.current.send();
    });

    expect(result.current).toEqual({
      loading: true,
      send: expect.any(Function)
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      reject();
      await expect(prom).rejects.toEqual({
        isAxiosError: true,
        response: {
          status: 400,
          statusText: 'Bad Request',
          data: 'Bad Request',
          headers: {},
          config: {}
        }
      });
    });

    expect(result.current).toEqual({
      loading: false,
      status: 400,
      error: 'Bad Request',
      send: expect.any(Function)
    });
  });

  it('should cancel api call result', async () => {
    // Render
    let cancel: CancelTokenSource;

    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockImplementation((cnl) => {
        cancel = cnl;

        return new Promise<AxiosResponse<string>>(() => undefined);
      });

    const { result } = renderHook(() => useDeleteRequest(spy));

    // Checks
    let prom: ApiPromise<string>;
    act(() => {
      prom = result.current.send();
    });

    expect(spy).toHaveBeenCalledTimes(1);

    // Cancel
    jest.spyOn(cancel!, 'cancel');
    act(() => {
      prom.cancel();
    });

    expect(cancel!.cancel).toHaveBeenCalled();
  });
});