import gulp from 'gulp';
import _babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import { step } from './utils';

// Interface
export type BabelOptions = Parameters<typeof _babel>[0] & { envName: string };
export interface ToolsBabelPaths {
  /**
   * Glob to source files
   */
  src: string;

  /**
   * Babel env to use
   */
  env: string;

  /**
   * Output directory
   */
  output: string;
}

// Task
export function task(name: string, paths: ToolsBabelPaths) {
  // Gulp task
  gulp.task(name, () => gulp.src(paths.src, { since: gulp.lastRun(name) })
    .pipe(sourcemaps.init())
    .pipe(_babel({ envName: paths.env } as any))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output))
  );
}

export function babel(options: BabelOptions) {
  return step(
    _babel(options),
    sourcemaps.write('.')
  );
}