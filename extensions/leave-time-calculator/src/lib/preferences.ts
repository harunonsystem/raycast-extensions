import { getPreferenceValues } from "@raycast/api";

export type WorkPreferences = {
  workHours: number;
  breakMinutes: number;
};

// Both commands (calculate-leave-time, calculate-leave-time-view) share
// identical preference definitions in package.json. Keep them in sync.
type CommandPreferences = Preferences.CalculateLeaveTime;

export function getWorkPreferences(): WorkPreferences {
  const prefs = getPreferenceValues<CommandPreferences>();
  const workHours = parseFloat(prefs.defaultWorkHours);
  const breakMinutes = parseInt(prefs.defaultBreakMinutes, 10);
  return {
    workHours: Number.isNaN(workHours) ? 8 : workHours,
    breakMinutes: Number.isNaN(breakMinutes) ? 60 : breakMinutes,
  };
}
