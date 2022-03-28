import { steps } from '@jujulego/flow';
import _terser from 'gulp-terser';
import rename from 'gulp-rename';

// Types
export type TerserOptions = Parameters<typeof _terser>[0];

// Steps
export function terser(suffix = '.min', options: TerserOptions) {
  return steps(
    _terser(options),
    rename({ suffix })
  );
}
