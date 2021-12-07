import filter from 'gulp-filter';
import rename from 'gulp-rename';
import _terser from 'gulp-terser';

import { steps } from './utils';

// Types
export type TerserOptions = Parameters<typeof _terser>[0];

// Step
export function terser(options: TerserOptions) {
  // Steps
  return steps(
    filter('**/*.js'),
    _terser(options),
    rename({ suffix: '.min' }),
  );
}