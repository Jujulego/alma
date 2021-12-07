import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import flatten from 'lodash.flatten';

// Types
export type RStream = NodeJS.ReadableStream;
export type WStream = NodeJS.WritableStream;
export type RWStream = NodeJS.ReadWriteStream;

export type SStep = [RStream, ...RWStream[]];
export type MStep = RWStream[];
export type EStep = [...RWStream[], WStream];
export type Step = SStep | MStep | EStep;

export type Flow = [RStream | SStep, ...(RWStream | MStep)[], WStream | EStep];

export type StepResult<S> = S extends [...unknown[], infer R] ? R : S;
export type FlowResult<F extends Flow> = F extends [...unknown[], infer T] ? StepResult<T> : never;

// Utils
export function flow<F extends Flow>(...streams: F): FlowResult<F> {
  const [first, ...next] = flatten(streams) as RWStream[];
  let res = first;

  for (const stream of next) {
    res = res.pipe(stream);
  }

  return res as FlowResult<F>;
}

export function steps<S extends Step>(...step: S): S {
  return step;
}

export function src(...params: Parameters<typeof gulp.src>) {
  return steps(
    gulp.src(...params),
    sourcemaps.init()
  );
}

export function dest(path: string) {
  return steps(
    sourcemaps.write('.'),
    gulp.dest(path),
  );
}