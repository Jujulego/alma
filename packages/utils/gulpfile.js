import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { babel, dest, dts, flow, rollup, src, terser, ts } from 'alma-tools';
import del from 'del';
import gulp from 'gulp';
import filter from 'gulp-filter';
import externals from 'rollup-plugin-node-externals';

// Config
const paths = {
  src: 'src/**/*.{ts,tsx}',
  tsconfig: 'tsconfig.json',
  deps: [
    '../../.pnp.*'
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

gulp.task('bundle:umd', () => flow(
  rollup({
    input: 'dist/esm/index.js',
    output: {
      file: 'alma-utils.js',
      format: 'umd',
      name: '@jujulego/alma-utils',
    },
    plugins: [
      externals(),
      nodeResolve(),
      commonjs(),
    ]
  }),
  dest('dist/umd'),
  filter('alma-utils.js'),
  terser('.min', { mangle: { toplevel: false } }),
  dest('dist/umd'),
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
  'bundle:umd',
));

gulp.task('watch', () => gulp.watch([...paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.series(
    gulp.parallel('build:cjs', 'build:esm', 'build:types'),
    'bundle:umd',
  )
));
