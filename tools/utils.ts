import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';

// Types
export type RStream = NodeJS.ReadableStream;
export type WStream = NodeJS.WritableStream;
export type RWStream = NodeJS.ReadWriteStream;

export type Flow = [RStream, ...RWStream[], WStream];
export type FlowResult<F extends Flow> = F extends [...unknown[], infer T] ? Awaited<T> : never;

// Utils
export function flow<F extends Flow>(...streams: F): FlowResult<F> {
  const [first, ...next] = streams;
  let res = first;

  for (const stream of next as RWStream[]) {
    res = res.pipe(stream);
  }

  return res as FlowResult<F>;
}

export function step<S extends RWStream[]>(...step: S): S {
  return step;
}

export function src(...params: Parameters<typeof gulp.src>) {
  return step(
    gulp.src(...params),
    sourcemaps.init()
  );
}