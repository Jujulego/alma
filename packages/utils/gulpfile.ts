import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import typescript from 'gulp-typescript';
import webpack from 'webpack-stream';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebpackPnpExternals } = require('webpack-pnp-externals');

// Config
const paths = {
  entry: 'dist/cjs/index.js',
  src: 'src/**/*.{ts,tsx}',
  deps: [
    '../../.pnp.*'
  ]
};

const dts = typescript.createProject('tsconfig.json', {
  isolatedModules: false,
  emitDeclarationOnly: true
});

// Tasks
gulp.task('clean', () => del(['dist']));

gulp.task('build:cjs', () => gulp.src(paths.src, { since: gulp.lastRun('build:cjs') })
  .pipe(babel({ envName: 'cjs' } as any))
  .pipe(gulp.dest('dist/cjs'))
);

gulp.task('build:esm', () => gulp.src(paths.src, { since: gulp.lastRun('build:esm') })
  .pipe(babel({ envName: 'esm' } as any))
  .pipe(gulp.dest('dist/esm'))
);

gulp.task('build:types', () => gulp.src(paths.src, { since: gulp.lastRun('build:types') })
  .pipe(dts()).dts
  .pipe(gulp.dest('dist/types'))
);

gulp.task('bundle:umd', () => gulp.src(paths.entry, { since: gulp.lastRun('bundle:umd') })
  .pipe(webpack({
    mode: 'production',
    output: {
      filename: 'alma-utils.js',
      library: {
        name: '@jujulego/alma-utils',
        type: 'umd'
      }
    },
    externals: [
      WebpackPnpExternals(),
    ]
  }))
  .pipe(gulp.dest('dist/umd'))
);

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types'),
  'bundle:umd',
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:types')
));