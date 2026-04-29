export type ConflictResolution = 'local_wins' | 'remote_wins' | 'same_version';

interface VersionConflictInput {
  localVersion: number;
  remoteVersion: number;
}

export function resolveVersionConflict({ localVersion, remoteVersion }: VersionConflictInput): ConflictResolution {
  if (remoteVersion > localVersion) {
    return 'remote_wins';
  }

  if (localVersion > remoteVersion) {
    return 'local_wins';
  }

  return 'same_version';
}
