import { renderHook } from '@testing-library/react-hooks';

import { AlmaApiSetup, ApiFetcher, ApiResource, ApiResponse, $url, useApi } from '../../src';

// Setup
const fetcher: jest.MockedFunction<ApiFetcher> = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  jest.useFakeTimers();

  fetcher.mockImplementation(() => new Promise<ApiResponse<string>>((resolve) => {
    setTimeout(() => resolve({
      status: 200,
      statusText: 'OK',
      headers: {},
      data: 'success'
    }), 1);
  }));
});

// Tests
describe('useApi', () => {
  describe('Query requests (no body => get, head, options, delete)', () => {
    it('should send request to the given url using useApiRequest', () => {
      // Render
      const { result } = renderHook(() => useApi('get', '/test/8'), {
        wrapper: ({ children }) => (
          <AlmaApiSetup fetcher={fetcher}>
            { children }
          </AlmaApiSetup>
        )
      });

      // Run request
      const res = result.current();

      expect(res).toBeInstanceOf(ApiResource);
      expect(fetcher).toHaveBeenCalledWith({
        method: 'get',
        url: '/test/8',
        query: {},
        headers: {},
        responseType: 'json',
      }, expect.any(AbortSignal));
    });

    it('should send request to the built url', () => {
      // Render
      const { result } = renderHook(() => useApi('get', $url`/test/${'id'}`), {
        wrapper: ({ children }) => (
          <AlmaApiSetup fetcher={fetcher}>
            { children }
          </AlmaApiSetup>
        )
      });

      // Run request
      const res = result.current({ id: 8 });

      expect(res).toBeInstanceOf(ApiResource);
      expect(fetcher).toHaveBeenCalledWith({
        method: 'get',
        url: '/test/8',
        query: {},
        headers: {},
        responseType: 'json',
      }, expect.any(AbortSignal));
    });
  });

  describe('Mutation requests (with body => post, patch, put)', () => {
    it('should send request to the given url using useApiRequest', () => {
      // Render
      const { result } = renderHook(() => useApi('post', '/test/8'), {
        wrapper: ({ children }) => (
          <AlmaApiSetup fetcher={fetcher}>
            { children }
          </AlmaApiSetup>
        )
      });

      // Run request
      const res = result.current('body');

      expect(res).toBeInstanceOf(ApiResource);
      expect(fetcher).toHaveBeenCalledWith({
        method: 'post',
        url: '/test/8',
        query: {},
        headers: {},
        body: 'body',
        responseType: 'json',
      }, expect.any(AbortSignal));
    });

    it('should send request to the built url', () => {
      // Render
      const { result } = renderHook(() => useApi('post', $url`/test/${'id'}`), {
        wrapper: ({ children }) => (
          <AlmaApiSetup fetcher={fetcher}>
            { children }
          </AlmaApiSetup>
        )
      });

      // Run request
      const res = result.current({ id: 8 }, 'body');

      expect(res).toBeInstanceOf(ApiResource);
      expect(fetcher).toHaveBeenCalledWith({
        method: 'post',
        url: '/test/8',
        query: {},
        headers: {},
        body: 'body',
        responseType: 'json',
      }, expect.any(AbortSignal));
    });
  });
});
