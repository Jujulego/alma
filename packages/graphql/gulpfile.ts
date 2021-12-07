import { dts, flow, src } from 'alma-tools';
import babel from 'alma-tools/babel';
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

babel.task('build:cjs', { src: paths.src, env: 'cjs', output: path.join(paths.output, 'cjs') });
babel.task('build:esm', { src: paths.src, env: 'esm', output: path.join(paths.output, 'esm') });

gulp.task('build:types', () => flow(
  ...src(paths.src, { since: gulp.lastRun('build:types') }),
  ...dts('tsconfig.json'),
  gulp.dest(path.join(paths.output, 'types')),
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));