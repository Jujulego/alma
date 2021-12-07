import _babel from 'gulp-babel';

import { steps } from './utils';

// Types
export type BabelOptions = Parameters<typeof _babel>[0] & { envName: string };

// Step
export function babel(options: BabelOptions) {
  return steps(
    _babel(options)
  );
}