import { GraphQLError } from 'graphql';

// Types
export interface GqlResponse<D> {
  data?: D;
  errors: readonly GraphQLError[];
}
