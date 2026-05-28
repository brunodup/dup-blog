import * as migration_20260528_000000_initial_baseline from './20260528_000000_initial_baseline';

export const migrations = [
  {
    up: migration_20260528_000000_initial_baseline.up,
    down: migration_20260528_000000_initial_baseline.down,
    name: '20260528_000000_initial_baseline',
  },
];
