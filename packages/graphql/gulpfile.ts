import { babel, dest, dts, flow, src } from 'alma-tools';
import del from 'del';
import gulp from 'gulp';
import path from 'path';

// Config
const paths = {
  src: 'src/**/*.{ts,tsx}',
  output: 'dist',
  deps: [
    '../../.pnp.*',
    '../api/dist/types/**',
    '../utils/dist/types/**',
  ]
};

// Tasks
gulp.task('clean', () => del(paths.output));

gulp.task('build:cjs', () => flow(
  src(paths.src, { since: gulp.lastRun('build:cjs') }),
  babel({ envName: 'cjs' }),
  dest(path.join(paths.output, 'cjs'))
));

gulp.task('build:esm', () => flow(
  src(paths.src, { since: gulp.lastRun('build:esm') }),
  babel({ envName: 'esm' }),
  dest(path.join(paths.output, 'esm'))
));

gulp.task('build:types', () => flow(
  src(paths.src, { since: gulp.lastRun('build:types') }),
  dts('tsconfig.json'),
  dest(path.join(paths.output, 'types')),
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));