import { GqlError, GqlErrorResponse, GqlRequest, GqlResponse, GqlVariables } from '../types';

// Types
interface GqlSubscriptionConnectionInit {
  type: 'GQL_CONNECTION_INIT';
  payload: unknown;
}

interface GqlSubscriptionConnectionTerminate {
  type: 'GQL_CONNECTION_TERMINATE';
}

export type GqlSubscriptionClientConnectionMessage = GqlSubscriptionConnectionInit | GqlSubscriptionConnectionTerminate;

interface GqlSubscriptionStart<D = unknown, V extends GqlVariables = GqlVariables> {
  type: 'GQL_START';
  id: string;
  payload: GqlRequest<D, V>;
}

interface GqlSubscriptionStop {
  type: 'GQL_STOP';
  id: string;
}

export type GqlSubscriptionClientDataMessage<D = unknown, V extends GqlVariables = GqlVariables> = GqlSubscriptionStart<D, V> | GqlSubscriptionStop;
export type GqlSubscriptionClientMessage<D = unknown, V extends GqlVariables = GqlVariables> = GqlSubscriptionClientConnectionMessage | GqlSubscriptionClientDataMessage<D, V>;

interface GqlSubscriptionConnectionError {
  type: 'GQL_CONNECTION_TERMINATE';
  payload: unknown;
}

interface GqlSubscriptionConnectionAck {
  type: 'GQL_CONNECTION_ACK';
}

interface GqlSubscriptionConnectionKeepAlive {
  type: 'GQL_CONNECTION_KEEP_ALIVE';
}

export type GqlSubscriptionServerConnectionMessage = GqlSubscriptionConnectionError | GqlSubscriptionConnectionAck | GqlSubscriptionConnectionKeepAlive;

interface GqlSubscriptionData<D = unknown> {
  type: 'GQL_DATA';
  id: string;
  payload: GqlResponse<D>;
}

interface GqlSubscriptionError {
  type: 'GQL_ERROR';
  id: string;
  payload: GqlErrorResponse;
}

interface GqlSubscriptionComplete {
  type: 'GQL_COMPLETE';
  id: string;
}

export type GqlSubscriptionServerDataMessage<D = unknown> = GqlSubscriptionData<D> | GqlSubscriptionError | GqlSubscriptionComplete;
export type GqlSubscriptionServerMessage<D = unknown> = GqlSubscriptionServerConnectionMessage | GqlSubscriptionServerDataMessage<D>;
