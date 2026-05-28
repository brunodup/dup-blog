import * as migration_20260527_111352 from './20260527_111352';
import * as migration_20260528_background_video from './20260528_background_video';

export const migrations = [
  {
    up: migration_20260527_111352.up,
    down: migration_20260527_111352.down,
    name: '20260527_111352'
  },
  {
    up: migration_20260528_background_video.up,
    down: migration_20260528_background_video.down,
    name: '20260528_background_video'
  },
];
