import { steps } from '@jujulego/flow';
import _rollup from '@rollup/stream';
import sourcemaps from 'gulp-sourcemaps';
import { InputOptions, OutputOptions, RollupCache } from 'rollup';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

// Types
export interface RollupConfig extends Omit<InputOptions, 'cache'> {
  output: OutputOptions & { file: string };
}

// Step
export function rollup(config: RollupConfig) {
  let cache: RollupCache | undefined = undefined;

  return steps(
    _rollup({ ...config, cache })
      .on('bundle', (bundle) => { cache = bundle; }),
    source(config.output.file),
    buffer(),
    sourcemaps.init({ loadMaps: true })
  );
}
