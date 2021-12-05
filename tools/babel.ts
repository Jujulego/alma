import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';

// Interface
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
    .pipe(babel({ envName: paths.env } as any))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output))
  );
}

export default { task };