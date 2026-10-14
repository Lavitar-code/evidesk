export type AppPreferences = {
  compactMode: boolean;
  reducedMotion: boolean;
  showCommandHint: boolean;
  autoOpenDetailPanel: boolean;
};

export const defaultAppPreferences: AppPreferences = {
  compactMode: false,
  reducedMotion: false,
  showCommandHint: true,
  autoOpenDetailPanel: true,
};