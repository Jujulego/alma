import { renderHook } from '@testing-library/react-hooks';
import { createClient as _createClient, Client } from 'graphql-ws';
import { FC, ReactNode, useContext } from 'react';

import { GqlWsClientContext, GqlWsClient } from '../../src';

// Mocks
jest.mock('graphql-ws');
const createClient = _createClient as jest.MockedFunction<typeof _createClient>;

// Setup
const client: Client = {
  on: () => () => undefined,
  subscribe: () => () => undefined,
  dispose: () => undefined
};

beforeEach(() => {
  jest.resetAllMocks();

  // Mocks
  createClient.mockReturnValue(client);
});

// Tests suites
describe('GqlWsClient', () => {
  // Tests
  it('should provide a graphql-ws Client instance', () => {
    // Render
    const wrapper: FC<{ children?: ReactNode }> = ({ children }) => (
      <GqlWsClient endpoint="/api/graphql">{ children }</GqlWsClient>
    );

    const { result } = renderHook(() => useContext(GqlWsClientContext), { wrapper });

    expect(result.current).toEqual({
      client: client
    });

    expect(createClient).toHaveBeenCalledWith({ url: '/api/graphql' });
  });
});
