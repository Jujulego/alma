import { AbortResource } from '@jujulego/alma-resources';
import { GraphQLError } from 'graphql';

// Utils
export type GqlResource<D> = AbortResource<GqlResponse<D>>;

// Types
export interface GqlResponse<D> {
  data?: D;
  errors: readonly GraphQLError[];
}
