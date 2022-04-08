// Types
export type ApiUrl<A> = string | ApiUrlBuilder<A>;
export type ApiUrlBuilder<A> = (args: A) => string;

// Utils
export function normalizeUrl<A = void>(url: ApiUrl<A>): ApiUrlBuilder<A> {
  return typeof url === 'string' ? () => url : url;
}
