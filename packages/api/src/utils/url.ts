// Types
type ParameterArray<T extends string, R extends string[]> = [T, ...R];

export type ApiUrl<A> = A extends void ? string | (() => string) : (arg: A) => string;
export type ApiUrlBuilder<A> = (arg: A) => string;

export type ApiUrlArg<P extends string[]> = P extends ParameterArray<infer N, infer R>
  ? { readonly [K in N]: string } & ApiUrlArg<R>
  : P extends []
    ? unknown
    : never;

// Constants
export const URL_DEPS_SYMBOL = Symbol('jujulego:alma-api:url-deps');

// Template tag
export function url(strings: TemplateStringsArray, ...param: []): string;
export function url<P extends string[]>(strings: TemplateStringsArray, ...param: P): (arg: ApiUrlArg<P>) => string;
export function url<P extends string[]>(strings: TemplateStringsArray, ...param: P) {
  if (param.length === 0) {
    return strings.join('');
  }

  const builder = (arg: ApiUrlArg<P>) => param.reduce(
    (p, r, i) => r + arg[p as keyof ApiUrlArg<P>] + strings[i+1],
    strings[0]
  );

  (builder as any)[URL_DEPS_SYMBOL] = [strings, ...param];

  return builder;
}

// Utils
export function normalizeUrl<A = void>(url: ApiUrl<A>): ApiUrlBuilder<A> {
  return typeof url === 'string' ? () => url : url;
}
