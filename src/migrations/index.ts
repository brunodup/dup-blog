import * as migration_20260528_000000_initial_baseline from './20260528_000000_initial_baseline';
import * as migration_20260528_120000_add_background_video_to_menu from './20260528_120000_add_background_video_to_menu';

export const migrations = [
  {
    up: migration_20260528_000000_initial_baseline.up,
    down: migration_20260528_000000_initial_baseline.down,
    name: '20260528_000000_initial_baseline',
  },
  {
    up: migration_20260528_120000_add_background_video_to_menu.up,
    down: migration_20260528_120000_add_background_video_to_menu.down,
    name: '20260528_120000_add_background_video_to_menu',
  },
];
