import sourcemaps from 'gulp-sourcemaps';
import typescript from 'gulp-typescript';

import { step } from './utils';

// Step
export function dts(tsconfig: string) {
  const prj = typescript.createProject(tsconfig, {
    isolatedModules: false,
    emitDeclarationOnly: true
  });

  return step(
    prj(),
    sourcemaps.write('.'),
  );
}