import del from 'del';
import gulp from 'gulp';
import babel from 'gulp-babel';
import typescript from 'gulp-typescript';

// Config
const paths = {
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
gulp.task('clean', () => del('dist'));

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

gulp.task('build', gulp.parallel('build:cjs', 'build:esm', 'build:types'));

gulp.task('watch', () => gulp.watch([paths.src, ...paths.deps], { ignoreInitial: false },
  gulp.parallel('build:cjs', 'build:types')
));