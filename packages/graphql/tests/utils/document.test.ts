// noinspection GraphQLUnresolvedReference
import { print } from 'graphql';

import { buildRequest, gql } from '../../src';

// Setup
beforeEach(() => {
  jest.resetAllMocks();
});

// Tests suites
describe('buildRequest', () => {
  // Tests
  it('should return request with both query and operationName', async () => {
    const doc = gql`
        query Test {
            test {
                isSuccessful
            }
        }
    `;

    // Checks
    expect(buildRequest(doc)).toEqual(
    {
      operationName: 'Test',
      query: print(doc),
    });
  });

  it('should return raw request without parsing', async () => {
    const doc = `
        query {
            test {
                isSuccessful
            }
        }
    `;

    // Checks
    expect(buildRequest(doc)).toEqual(
    {
      query: doc,
    });
  });

  it('should return request without parsing', async () => {
    const req = {
      query: `
          query {
              test {
                  isSuccessful
              }
          }
      `
  };

    // Checks
    expect(buildRequest(req)).toBe(req);
  });

  it('should return request without operationName (none set)', async () => {
    const doc = gql`
        query {
            test {
                isSuccessful
            }
        }
    `;

    // Checks
    expect(buildRequest(doc)).toEqual(
      {
        query: print(doc),
      });
  });

  it('should return request without operationName (multiple operations)', async () => {
    const doc = gql`
        query Test1 {
            test {
                isSuccessful
            }
        }
        
        query Test2 {
            test {
                isSuccessful
            }
        }
    `;

    // Checks
    expect(buildRequest(doc)).toEqual(
      {
        query: print(doc),
      });
  });
});
