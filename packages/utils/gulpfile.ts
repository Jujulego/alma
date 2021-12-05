import rollup from '@rollup/stream';
import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import filter from 'gulp-filter';
import rename from 'gulp-rename';
import sourcemaps from 'gulp-sourcemaps';
import terser from 'gulp-terser';
import typescript from 'gulp-typescript';
import { RollupCache } from 'rollup';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

// Config
const paths = {
  entry: 'dist/esm/index.js',
  src: 'src/**/*.{ts,tsx}',
  deps: [
    '../../.pnp.*'
  ]
};

const dts = typescript.createProject('tsconfig.json', {
  isolatedModules: false,
  emitDeclarationOnly: true
});

let cache: RollupCache;

// Tasks
gulp.task('clean', () => del(['dist']));

gulp.task('build:cjs', () => gulp.src(paths.src, { since: gulp.lastRun('build:cjs') })
  .pipe(sourcemaps.init())
  .pipe(babel({ envName: 'cjs' } as any))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist/cjs'))
);

gulp.task('build:esm', () => gulp.src(paths.src, { since: gulp.lastRun('build:esm') })
  .pipe(sourcemaps.init())
  .pipe(babel({ envName: 'esm' } as any))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist/esm'))
);

gulp.task('build:types', () => gulp.src(paths.src, { since: gulp.lastRun('build:types') })
  .pipe(sourcemaps.init())
  .pipe(dts()).dts
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('dist/types'))
);

gulp.task('bundle:umd', () =>
  rollup({
    input: paths.entry,
    external: ['react', 'dequal/lite'],
    cache,
    output: {
      file: 'alma-utils.js',
      format: 'umd',
      name: '@jujulego/alma-utils',
      globals: {
        'react': 'react',
        'dequal/lite': 'dequal',
      },
    }
  })
    .on('bundle', (bundle) => { cache = bundle; })
    .pipe(source('alma-utils.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/umd'))
    .pipe(filter(['*.js']))
    .pipe(terser({ keep_fnames: true, mangle: false }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/umd'))
);

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