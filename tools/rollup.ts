import _rollup from '@rollup/stream';
import sourcemaps from 'gulp-sourcemaps';
import { RollupCache, InputOptions, OutputOptions } from 'rollup';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

import { steps } from './utils';

// Types
export type RollupOptions = Omit<InputOptions, 'cache'> & { output: OutputOptions & { file: string } };

// Step
export function rollup(options: RollupOptions) {
  let cache: RollupCache | undefined;

  // Steps
  return steps(
    _rollup({ ...options, cache })
      .on('bundle', (bundle) => { cache = bundle; }),
    source(options.output.file),
    buffer(),
    sourcemaps.init({ loadMaps: true })
  );
}