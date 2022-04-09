// Types
export type ApiUrl<A extends unknown[]> = string | ApiUrlBuilder<A>;
export type ApiUrlBuilder<A extends unknown[]> = (...args: A) => string;

// Utils
export function normalizeUrl<A extends unknown[] = []>(url: ApiUrl<A>): ApiUrlBuilder<A> {
  return typeof url === 'string' ? () => url : url;
}
