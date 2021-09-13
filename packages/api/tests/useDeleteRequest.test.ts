import { AxiosResponse, CancelTokenSource } from 'axios';
import { act, renderHook } from '@testing-library/react-hooks';

import { APIPromise, useDeleteRequest } from '../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Test suites
describe('useGetRequest', () => {
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
    expect(result.current).toEqual(expect.objectContaining({ loading: false }));

    // After send
    let prom: APIPromise<string>;
    act(() => {
      prom = result.current.send();
    });

    expect(result.current).toEqual(expect.objectContaining({ loading: true }));
    expect(spy).toHaveBeenCalledTimes(1);

    // After receive
    await act(async () => {
      resolve('test');
      await expect(prom).resolves.toEqual('test');
    });

    expect(result.current).toEqual(expect.objectContaining({ data: 'test', loading: false }));
  });

  it('should cancel api call result', async () => {
    // Render
    let cancel: CancelTokenSource | null = null;

    const spy = jest.fn<Promise<AxiosResponse<string>>, [CancelTokenSource]>()
      .mockImplementation((cnl) => {
        cancel = cnl;

        return new Promise<AxiosResponse<string>>(() => undefined);
      });

    const { result } = renderHook(() => useDeleteRequest(spy));

    // Checks
    expect(result.current).toEqual(expect.objectContaining({ loading: false }));

    // After send
    let prom: APIPromise<string>;
    act(() => {
      prom = result.current.send();
    });

    expect(result.current).toEqual(expect.objectContaining({ loading: true }));
    expect(spy).toHaveBeenCalledTimes(1);

    // Cancel
    jest.spyOn(cancel!, 'cancel');
    act(() => {
      prom.cancel();
    });

    expect(cancel!.cancel).toHaveBeenCalled();
  });
});