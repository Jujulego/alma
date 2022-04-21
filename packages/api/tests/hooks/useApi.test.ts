import { renderHook } from '@testing-library/react-hooks';

import { ApiRequest, ApiResource, url, useApi, useApiRequest as _useApiRequest } from '../../src';

// Mocks
jest.mock('../../src/hooks/useApiRequest');
const useApiRequest = jest.mocked(_useApiRequest);

// Setup
const request = jest.fn<ApiResource<unknown>, [ApiRequest]>();

beforeEach(() => {
  jest.resetAllMocks();

  request.mockReturnValue(new ApiResource<unknown>(new Promise(() => undefined), new AbortController()));
  useApiRequest.mockReturnValue({ request });
});

// Tests
describe('useApi', () => {
  describe('Query requests (no body => get, head, options, delete)', () => {
    it('should send request to the given url using useApiRequest', () => {
      // Render
      const { result } = renderHook(() => useApi('get', '/test/8'));

      // Run request
      const res = result.current();

      expect(res).toBeInstanceOf(ApiResource);
      expect(request).toHaveBeenCalledWith({
        method: 'get',
        url: '/test/8',
        headers: {},
        responseType: 'json',
      });
    });

    it('should send request to the built url', () => {
      // Render
      const { result } = renderHook(() => useApi('get', url`/test/${'id'}`));

      // Run request
      const res = result.current({ id: 8 });

      expect(res).toBeInstanceOf(ApiResource);
      expect(request).toHaveBeenCalledWith({
        method: 'get',
        url: '/test/8',
        headers: {},
        responseType: 'json',
      });
    });
  });

  describe('Mutation requests (with body => post, patch, put)', () => {
    it('should send request to the given url using useApiRequest', () => {
      // Render
      const { result } = renderHook(() => useApi('post', '/test/8'));

      // Run request
      const res = result.current('body');

      expect(res).toBeInstanceOf(ApiResource);
      expect(request).toHaveBeenCalledWith({
        method: 'post',
        url: '/test/8',
        headers: {},
        body: 'body',
        responseType: 'json',
      });
    });

    it('should send request to the built url', () => {
      // Render
      const { result } = renderHook(() => useApi('post', url`/test/${'id'}`));

      // Run request
      const res = result.current({ id: 8 }, 'body');

      expect(res).toBeInstanceOf(ApiResource);
      expect(request).toHaveBeenCalledWith({
        method: 'post',
        url: '/test/8',
        headers: {},
        body: 'body',
        responseType: 'json',
      });
    });
  });
});
