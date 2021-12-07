import typescript from 'gulp-typescript';

// Step
export function dts(tsconfig: string) {
  const prj = typescript.createProject(tsconfig, {
    isolatedModules: false,
    emitDeclarationOnly: true
  });

  return prj();
}