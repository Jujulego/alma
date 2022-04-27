import { GqlVars } from './utils';

// Types
export interface GqlRequest<V extends GqlVars = GqlVars> {
  query: string;
  operationName?: string;
  variables?: V;
}
