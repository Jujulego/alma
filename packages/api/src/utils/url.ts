// Types
export type ApiUrl<A> = A extends void ? string | (() => string) : (arg: A) => string;
export type ApiUrlBuilder<A> = (arg: A) => string;

// Utils
export function normalizeUrl<A = void>(url: ApiUrl<A>): ApiUrlBuilder<A> {
  return typeof url === 'string' ? () => url : url;
}
