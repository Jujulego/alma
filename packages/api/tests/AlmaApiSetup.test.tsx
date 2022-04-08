import { renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';

import { AlmaApiSetup, ApiConfigContext, ApiFetcher, fetcher as defaultFetcher } from '../src';

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

    expect(configResult.current).toEqual({
      fetcher: defaultFetcher
    });
  });

  it('should setup config with given fetcher', () => {
    const fetcher: ApiFetcher = jest.fn();

    // Check config
    const { result: configResult } = renderHook(() => useContext(ApiConfigContext), {
      wrapper: ({ children }) => <AlmaApiSetup fetcher={fetcher}>{ children }</AlmaApiSetup>,
    });

    expect(configResult.current).toEqual({
      fetcher
    });
  });
});
