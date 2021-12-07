import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';

// Types
export type Awaitable<T> = T | Promise<T>;

export type RStream = NodeJS.ReadableStream;
export type WStream = NodeJS.WritableStream;
export type RWStream = NodeJS.ReadWriteStream;

export type Flow = [Awaitable<RStream>, ...Awaitable<RWStream>[], Awaitable<WStream>];
export type FlowResult<F extends Flow> = F extends [...unknown[], infer T] ? Awaited<T> : never;

// Utils
export async function flow<F extends Flow>(...streams: F): Promise<FlowResult<F>> {
  const [first, ...next] = streams;
  let res = await first;

  for (const stream of next as Awaitable<RWStream>[]) {
    res = res.pipe(await stream);
  }

  return res as FlowResult<F>;
}

export function step<S extends Awaitable<RWStream>[]>(...step: S): S {
  return step;
}

export function src(...params: Parameters<typeof gulp.src>) {
  return step(
    gulp.src(...params),
    sourcemaps.init()
  );
}