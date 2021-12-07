import { babel, dest, dts, flow, rollup, src, terser } from 'alma-tools';
import del from 'del';
import gulp from 'gulp';
import path from 'path';

// Config
const paths = {
  src: 'src/**/*.{ts,tsx}',
  output: 'dist',
  deps: [
    '../../.pnp.*'
  ]
};

// Tasks
gulp.task('clean', () => del(paths.output));

gulp.task('build:cjs', () => flow(
  ...src(paths.src, { since: gulp.lastRun('build:cjs') }),
  ...babel({ envName: 'cjs' }),
  ...dest(path.join(paths.output, 'cjs'))
));

gulp.task('build:esm', () => flow(
  ...src(paths.src, { since: gulp.lastRun('build:esm') }),
  ...babel({ envName: 'esm' }),
  ...dest(path.join(paths.output, 'esm'))
));

gulp.task('build:types', () => flow(
  ...src(paths.src, { since: gulp.lastRun('build:types') }),
  ...dts('tsconfig.json'),
  gulp.dest(path.join(paths.output, 'types')),
));

gulp.task('bundle:umd', () => flow(
  ...rollup({
    input: path.join(paths.output, 'esm/index.js'),
    external: ['react', 'dequal/lite'],
    output: {
      file: 'alma-utils.js',
      format: 'umd',
      name: '@jujulego/alma-utils',
      globals: {
        'react': 'react',
        'dequal/lite': 'dequal',
      },
    }
  }),
  ...dest(path.join(paths.output, 'umd')),
  ...terser({ keep_fnames: true, mangle: false }),
  ...dest(path.join(paths.output, 'umd')),
));

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
  'bundle:umd',
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.series(
    gulp.parallel('build:cjs', 'build:esm', 'build:types'),
    'bundle:umd',
  )
));