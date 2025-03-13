
export interface Period {
  name: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
}

export interface Schedule {
  name: string;
  periods: Period[];
}

export interface TimeInfo {
  currentPeriod: Period | null;
  nextPeriod: Period | null;
  timeUntilNextPeriod: number | null; // in milliseconds
  timeRemainingInPeriod: number | null; // in milliseconds
  isSchoolDay: boolean;
  progress: number; // 0-100
}
