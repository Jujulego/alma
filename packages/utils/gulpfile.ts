import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import rename from 'gulp-rename';
import terser from 'gulp-terser';
import typescript from 'gulp-typescript';
import webpack from 'webpack-stream';

// Config
const paths = {
  entry: 'src/index.ts',
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
gulp.task('clean', () => del(['lib', 'umd']));

gulp.task('build:cjs', () => gulp.src(paths.src, { since: gulp.lastRun('build:cjs') })
  .pipe(babel({ envName: 'cjs' } as any))
  .pipe(gulp.dest('lib'))
);

gulp.task('build:esm', () => gulp.src(paths.src, { since: gulp.lastRun('build:esm') })
  .pipe(babel({ envName: 'esm' } as any))
  .pipe(rename({ extname: '.mjs' }))
  .pipe(gulp.dest('lib'))
);

gulp.task('build:umd', () => gulp.src(paths.entry, { since: gulp.lastRun('build:umd') })
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  .pipe(webpack(require('./webpack.config')))
  .pipe(gulp.dest('umd'))
  .pipe(terser({ output: { wrap_iife: true } }))
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('umd'))
);

gulp.task('build:types', () => gulp.src(paths.src, { since: gulp.lastRun('build:types') })
  .pipe(dts()).dts
  .pipe(gulp.dest('lib'))
);

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('build:cjs', 'build:esm', 'build:types', 'build:umd'),
));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:types')
));