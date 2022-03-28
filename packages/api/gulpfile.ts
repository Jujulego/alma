import { babel, dest, dts, flow, src, ts } from 'alma-tools';
import del from 'del';
import gulp from 'gulp';

// Config
const paths = {
  src: 'src/**/*.{ts,tsx}',
  tsconfig: 'tsconfig.json',
  deps: [
    '../../.pnp.*',
    '../utils/dist/types/**',
  ]
};

// Tasks
gulp.task('clean', () => del('dist'));

gulp.task('build:cjs', () => flow(
  src(paths.src, { since: gulp.lastRun('build:cjs') }),
  ts(paths.tsconfig),
  babel({ envName: 'cjs' }),
  dest('dist/cjs')
));

gulp.task('build:esm', () => flow(
  src(paths.src, { since: gulp.lastRun('build:esm') }),
  ts(paths.tsconfig),
  babel({ envName: 'esm' }),
  dest('dist/esm')
));

gulp.task('build:types', () => flow(
  src(paths.src, { since: gulp.lastRun('build:esm') }),
  dts(paths.tsconfig),
  dest('dist/types')
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));

gulp.task('watch', () => gulp.watch([...paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));
