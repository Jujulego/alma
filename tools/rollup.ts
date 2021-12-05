import rollup from '@rollup/stream';
import gulp from 'gulp';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import { RollupCache, RollupOptions } from 'rollup';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

// Interface
export interface ToolsRollupPaths {
  /**
   * Rollup config
   */
  config: Omit<RollupOptions, 'cache'>;

  /**
   * Output directory
   */
  output: string;
}

// Task
export function task(name: string, paths: ToolsRollupPaths) {
  let cache: RollupCache;

  // Gulp task
  gulp.task(name, () => rollup({ ...paths.config, cache })
    .on('bundle', (bundle) => { cache = bundle; })
    .pipe(source('alma-utils.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output))
    .pipe(filter(['*.js']))
    .pipe(terser({ keep_fnames: true, mangle: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.output))
  );
}

export default { task };