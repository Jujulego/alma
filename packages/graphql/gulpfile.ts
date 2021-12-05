import babel from 'alma-tools/babel';
import dts from 'alma-tools/dts';
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

dts.task('build:types', {
  src: paths.src,
  tsconfig: 'tsconfig.json',
  output: path.join(paths.output, 'types')
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
));