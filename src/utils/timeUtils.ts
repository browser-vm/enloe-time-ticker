import { Period, Schedule, TimeInfo } from "@/types/schedule";

// Convert a time string (HH:MM) to milliseconds since midnight
export const timeToMs = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours * 60 * 60 + minutes * 60) * 1000;
};

// Get current time in milliseconds since midnight
export const getCurrentTimeMs = (): number => {
  const now = new Date();
  return (now.getHours() * 60 * 60 + now.getMinutes() * 60 + now.getSeconds()) * 1000;
};

// Format milliseconds to MM:SS
export const formatTimeMS = (ms: number): string => {
  if (ms === null || isNaN(ms)) return "--:--";
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Format milliseconds to HH:MM:SS
export const formatTimeLong = (ms: number): string => {
  if (ms === null || isNaN(ms)) return "--:--:--";
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

// Check if today is a school day (Monday-Friday)
export const isSchoolDay = (): boolean => {
  const now = new Date();
  const day = now.getDay();
  return day >= 1 && day <= 5;
};

// Get current time information based on the schedule
export const getCurrentTimeInfo = (schedule: Schedule): TimeInfo => {
  const currentTimeMs = getCurrentTimeMs();
  
  // Check if today is a school day
  if (!isSchoolDay()) {
    return {
      currentPeriod: null,
      nextPeriod: null,
      timeUntilNextPeriod: null,
      timeRemainingInPeriod: null,
      isSchoolDay: false,
      progress: 0
    };
  }
  
  // Find current period
  let currentPeriod: Period | null = null;
  let nextPeriod: Period | null = null;
  
  for (let i = 0; i < schedule.periods.length; i++) {
    const period = schedule.periods[i];
    const startMs = timeToMs(period.startTime);
    const endMs = timeToMs(period.endTime);
    
    if (currentTimeMs >= startMs && currentTimeMs <= endMs) {
      currentPeriod = period;
      nextPeriod = i < schedule.periods.length - 1 ? schedule.periods[i + 1] : null;
      break;
    }
    
    if (currentTimeMs < startMs && !nextPeriod) {
      nextPeriod = period;
      break;
    }
  }
  
  // Calculate time remaining in current period
  let timeRemainingInPeriod: number | null = null;
  let progress = 0;
  
  if (currentPeriod) {
    const endMs = timeToMs(currentPeriod.endTime);
    timeRemainingInPeriod = endMs - currentTimeMs;
    
    const startMs = timeToMs(currentPeriod.startTime);
    const totalDuration = endMs - startMs;
    progress = Math.min(100, Math.max(0, ((currentTimeMs - startMs) / totalDuration) * 100));
  }
  
  // Calculate time until next period
  let timeUntilNextPeriod: number | null = null;
  
  if (nextPeriod) {
    const nextStartMs = timeToMs(nextPeriod.startTime);
    timeUntilNextPeriod = nextStartMs - currentTimeMs;
  }
  
  return {
    currentPeriod,
    nextPeriod,
    timeUntilNextPeriod,
    timeRemainingInPeriod,
    isSchoolDay: true,
    progress
  };
};

// Define the A-Lunch and B-Lunch schedules
export const schedules: Record<string, Schedule> = {
  aLunch: {
    name: "A-Lunch",
    periods: [
      { name: "1st Period", startTime: "7:25", endTime: "8:52" },
      { name: "2nd Period", startTime: "8:58", endTime: "10:35" },
      { name: "Lunch", startTime: "10:41", endTime: "11:16" },
      { name: "3rd Period", startTime: "11:20", endTime: "12:47" },
      { name: "4th Period", startTime: "12:53", endTime: "14:20" }
    ]
  },
  bLunch: {
    name: "B-Lunch",
    periods: [
      { name: "1st Period", startTime: "7:25", endTime: "8:52" },
      { name: "2nd Period", startTime: "8:58", endTime: "10:35" },
      { name: "3rd Period", startTime: "10:41", endTime: "12:08" },
      { name: "Lunch", startTime: "12:12", endTime: "12:47" },
      { name: "4th Period", startTime: "12:53", endTime: "14:20" }
    ]
  }
};

// Calculate time until next school day
export const getTimeUntilSchool = (): number | null => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTimeMs = getCurrentTimeMs();
  
  // If it's a school day and current time is before school starts
  if (isSchoolDay() && currentTimeMs < timeToMs("7:25")) {
    return timeToMs("7:25") - currentTimeMs;
  }
  
  // If it's Friday after school or weekend, calculate time until Monday
  let daysUntilNextSchoolDay = 0;
  
  if (currentDay === 5 && currentTimeMs > timeToMs("14:20")) {
    // Friday after school ends - next school day is Monday (3 days away)
    daysUntilNextSchoolDay = 3;
  } else if (currentDay === 6) {
    // Saturday - next school day is Monday (2 days away)
    daysUntilNextSchoolDay = 2;
  } else if (currentDay === 0) {
    // Sunday - next school day is Monday (1 day away)
    daysUntilNextSchoolDay = 1;
  } else if (currentDay >= 1 && currentDay <= 4 && currentTimeMs > timeToMs("14:20")) {
    // Monday-Thursday after school - next school day is tomorrow
    daysUntilNextSchoolDay = 1;
  } else if (currentDay >= 1 && currentDay <= 5 && currentTimeMs <= timeToMs("14:20")) {
    // During school hours - no time until school since we're in school
    return null;
  }
  
  if (daysUntilNextSchoolDay > 0) {
    // Calculate milliseconds until next school day at 7:25 AM
    const nextSchoolDay = new Date(now);
    nextSchoolDay.setDate(now.getDate() + daysUntilNextSchoolDay);
    nextSchoolDay.setHours(7, 25, 0, 0);
    
    return nextSchoolDay.getTime() - now.getTime();
  }
  
  return null;
};

// Check if school is over for the day
export const isSchoolOver = (schedule: Schedule): boolean => {
  if (!isSchoolDay()) return true;
  
  const currentTimeMs = getCurrentTimeMs();
  const lastPeriod = schedule.periods[schedule.periods.length - 1];
  const schoolEndMs = timeToMs(lastPeriod.endTime);
  
  return currentTimeMs > schoolEndMs;
};

// Format period name
export const formatPeriodName = (period: Period | null): string => {
  if (!period) return "No Class";
  return period.name;
};

// Format period time range
export const formatPeriodTimeRange = (period: Period | null): string => {
  if (!period) return "";
  return `${period.startTime} - ${period.endTime}`;
};
