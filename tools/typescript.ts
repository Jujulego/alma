import typescript from 'gulp-typescript';

import { steps } from './utils';

// Step
export function dts(tsconfig: string) {
  const prj = typescript.createProject(tsconfig, {
    isolatedModules: false,
    emitDeclarationOnly: true
  });

  return steps(
    prj(),
  );
}