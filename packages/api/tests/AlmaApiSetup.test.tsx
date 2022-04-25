import { Warehouse } from '@jujulego/alma-resources';
import { renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';

import { AlmaApiSetup, ApiConfigContext, ApiFetcher, globalApiConfig } from '../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests
describe('AlmaApiSetup', () => {
  it('should setup config with default fetcher', () => {
    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual(globalApiConfig());
  });

  it('should setup config with given fetcher', () => {
    const fetcher: ApiFetcher = jest.fn();
    const warehouse = new Warehouse();

    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup fetcher={fetcher} warehouse={warehouse}>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual({
      fetcher,
      warehouse
    });
  });
});
