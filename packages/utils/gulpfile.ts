import del from 'del';
import gulp from 'gulp';

import babel from 'alma-tools/babel';
import dts from 'alma-tools/dts';
import rollup from 'alma-tools/rollup';

// Config
const paths = {
  src: 'src/**/*.{ts,tsx}',
  tsconfig: 'tsconfig.json',

  entry: 'dist/esm/index.js',
  deps: [
    '../../.pnp.*'
  ]
};

// Tasks
gulp.task('clean', () => del(['dist']));

babel.task('build:cjs', { ...paths, env: 'cjs', output: 'dist/cjs' });
babel.task('build:esm', { ...paths, env: 'esm', output: 'dist/esm' });

dts.task('build:types', { ...paths, output: 'dist/types' });

rollup.task('bundle:umd', {
  config: {
    input: paths.entry,
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
  output: 'dist/umd'
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