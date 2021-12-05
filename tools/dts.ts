import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

// Interface
export interface ToolsDtsPaths {
  /**
   * Glob to source files
   */
  src: string;

  /**
   * Path to tsconfig file
   */
  tsconfig: string;

  /**
   * Output directory
   */
  output: string;
}

// Task
export function task(name: string, paths: ToolsDtsPaths) {
  const dts = typescript.createProject(paths.tsconfig, {
    isolatedModules: false,
    emitDeclarationOnly: true
  });

  // Gulp task
  gulp.task(name, () => gulp.src(paths.src, { since: gulp.lastRun(name) })
    .pipe(sourcemaps.init())
    .pipe(dts()).dts
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output))
  );
}

export default { task };