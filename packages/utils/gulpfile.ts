import babel from 'alma-tools/babel';
import dts from 'alma-tools/dts';
import rollup from 'alma-tools/rollup';
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

babel.task('build:cjs', { src: paths.src, env: 'cjs', output: path.join(paths.output, 'cjs') });
babel.task('build:esm', { src: paths.src, env: 'esm', output: path.join(paths.output, 'esm') });

dts.task('build:types', {
  src: paths.src,
  tsconfig: 'tsconfig.json',
  output: path.join(paths.output, 'types')
});

rollup.task('bundle:umd', {
  config: {
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
  },
  output: path.join(paths.output, 'umd')
});

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