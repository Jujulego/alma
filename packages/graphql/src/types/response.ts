import { AbortResource } from '@jujulego/alma-resources';
import { GraphQLError } from 'packages/graphql/src/gql';

// Utils
export type GqlResource<D> = AbortResource<GqlResponse<D>>;

// Types
export interface GqlResponse<D> {
  data?: D;
  errors: readonly GraphQLError[];
}
