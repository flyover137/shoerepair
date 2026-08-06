import type { OpeningHoursConfig, TimeInterval, DayOfWeek } from './types.js';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Parses a Date object into its parts relative to a specific IANA timezone.
 */
export function getLocalDateTime(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    weekday: 'long',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);
  const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));

  const y = parseInt(partMap.year, 10);
  const m = parseInt(partMap.month, 10);
  const d = parseInt(partMap.day, 10);
  const hour = partMap.hour;
  const minute = partMap.minute;
  const weekday = partMap.weekday.toLowerCase() as DayOfWeek;

  const dateStr = `${y}-${pad(m)}-${pad(d)}`;
  const timeStr = `${pad(parseInt(hour, 10))}:${pad(parseInt(minute, 10))}`;

  return {
    year: y,
    month: m,
    day: d,
    hour: parseInt(hour, 10),
    minute: parseInt(minute, 10),
    dayOfWeek: weekday,
    dateStr,
    timeStr,
  };
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Gets the opening hours intervals and override details for a specific Date in the target timezone.
 */
export function getIntervalsForDate(config: OpeningHoursConfig, date: Date) {
  const local = getLocalDateTime(date, config.timezone);
  const specialRule = config.specialDates?.find(r => r.date === local.dateStr);
  return {
    intervals: specialRule ? specialRule.intervals : (config.regularHours[local.dayOfWeek] || []),
    isSpecial: !!specialRule,
    label: specialRule?.label,
    dateStr: local.dateStr,
    dayOfWeek: local.dayOfWeek
  };
}

/**
 * Checks if the business is currently open in the configured timezone.
 * Supports date override for testing/mocking.
 * Accounts for midnight-crossing shifts.
 */
export function isCurrentlyOpen(config: OpeningHoursConfig, date: Date = new Date()) {
  const localToday = getLocalDateTime(date, config.timezone);
  const currentTotal = localToday.hour * 60 + localToday.minute;

  // 1. Check today's intervals
  const todayInfo = getIntervalsForDate(config, date);
  let activeInterval: TimeInterval | undefined;
  let isSpecial = todayInfo.isSpecial;
  let label = todayInfo.label;

  for (const interval of todayInfo.intervals) {
    const opensTotal = parseTimeToMinutes(interval.opens);
    const closesTotal = parseTimeToMinutes(interval.closes);

    if (closesTotal > opensTotal) {
      // Normal shift: completely within the same calendar day
      if (currentTotal >= opensTotal && currentTotal < closesTotal) {
        activeInterval = interval;
        break;
      }
    } else {
      // Midnight-crossing shift: opens today, goes past midnight (so active until midnight today)
      if (currentTotal >= opensTotal) {
        activeInterval = interval;
        break;
      }
    }
  }

  // 2. If not open in today's intervals, check if open in yesterday's carry-over shift
  if (!activeInterval) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayInfo = getIntervalsForDate(config, yesterday);

    for (const interval of yesterdayInfo.intervals) {
      const opensTotal = parseTimeToMinutes(interval.opens);
      const closesTotal = parseTimeToMinutes(interval.closes);

      if (closesTotal <= opensTotal) {
        // Shift crossed midnight. Current time is before the closing time.
        if (currentTotal < closesTotal) {
          activeInterval = interval;
          isSpecial = yesterdayInfo.isSpecial;
          label = yesterdayInfo.label;
          break;
        }
      }
    }
  }

  return {
    isOpen: !!activeInterval,
    activeInterval,
    isSpecial,
    label,
    localTime: localToday.timeStr,
    localDate: localToday.dateStr,
    dayOfWeek: localToday.dayOfWeek
  };
}

export function formatTimeStr(time24: string, format: '12h' | '24h' = '12h'): string {
  const [hStr, mStr] = time24.split(':');
  const padded = `${hStr.padStart(2, '0')}:${mStr}`;
  if (format === '24h') {
    return padded;
  }
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${mStr} ${ampm}`;
}

/**
 * Formats a single time interval.
 */
export function formatInterval(interval: TimeInterval, format: '12h' | '24h' = '12h'): string {
  return `${formatTimeStr(interval.opens, format)} - ${formatTimeStr(interval.closes, format)}`;
}

/**
 * Formats an array of intervals into a comma-separated list of working hours (e.g. "09:00 - 12:00, 13:00 - 17:00")
 * or returns closedText if empty/closed.
 */
export function formatHours(intervals: TimeInterval[] | undefined, format: '12h' | '24h' = '12h', closedText: string = 'Closed'): string {
  if (!intervals || intervals.length === 0) {
    return closedText;
  }
  return intervals.map(interval => formatInterval(interval, format)).join(', ');
}

export interface OpeningStatusDetails {
  isOpen: boolean;
  message: string;
  dayOfWeek: DayOfWeek;
}

/**
 * Calculates user-friendly opening status messages like "Today we're open until 6:00 PM"
 * or "We're closed and will reopen tomorrow at 8:00 AM".
 * Accounts for midnight-crossing shifts.
 */
export function getOpeningStatusDetails(
  config: OpeningHoursConfig,
  date: Date = new Date(),
  format: '12h' | '24h' = '12h'
): OpeningStatusDetails {
  const local = getLocalDateTime(date, config.timezone);
  const currentTotal = local.hour * 60 + local.minute;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // 1. Check if currently open
  const currentStatus = isCurrentlyOpen(config, date);
  if (currentStatus.isOpen && currentStatus.activeInterval) {
    const closesStr = formatTimeStr(currentStatus.activeInterval.closes, format);
    const labelSuffix = currentStatus.label ? ` (${currentStatus.label})` : '';
    return {
      isOpen: true,
      message: `Today we're open until ${closesStr}${labelSuffix}`,
      dayOfWeek: local.dayOfWeek
    };
  }

  // 2. Currently closed. Scan day-by-day (up to 7 days) to find the next opening slot.
  for (let offset = 0; offset <= 7; offset++) {
    const scanDate = new Date(date);
    scanDate.setDate(date.getDate() + offset);
    
    const scanInfo = getIntervalsForDate(config, scanDate);
    const sortedIntervals = [...scanInfo.intervals].sort((a, b) => parseTimeToMinutes(a.opens) - parseTimeToMinutes(b.opens));

    for (const interval of sortedIntervals) {
      const opensTotal = parseTimeToMinutes(interval.opens);
      
      // If scanning today, only look at future slots
      if (offset === 0 && opensTotal <= currentTotal) {
        continue;
      }

      const opensStr = formatTimeStr(interval.opens, format);
      let dayLabel = '';
      if (offset === 0) {
        dayLabel = 'today';
      } else if (offset === 1) {
        dayLabel = 'tomorrow';
      } else {
        dayLabel = `on ${capitalize(scanInfo.dayOfWeek)}`;
      }

      const specialLabel = scanInfo.label ? ` (${scanInfo.label})` : '';

      return {
        isOpen: false,
        message: `We're closed and will reopen ${dayLabel} at ${opensStr}${specialLabel}`,
        dayOfWeek: local.dayOfWeek
      };
    }
  }

  return {
    isOpen: false,
    message: "We are currently closed",
    dayOfWeek: local.dayOfWeek
  };
}

export interface HeaderStatusDetails {
  isOpen: boolean;
  stateLabel: 'OPEN' | 'CLOSED';
  detailLabel: string;
}

/**
 * Calculates simplified opening status details for the compact header pill.
 * Returns e.g. stateLabel: "OPEN", detailLabel: "Until 6:00 PM"
 */
export function getHeaderStatusDetails(
  config: OpeningHoursConfig,
  date: Date = new Date(),
  format: '12h' | '24h' = '12h'
): HeaderStatusDetails {
  const local = getLocalDateTime(date, config.timezone);
  const currentTotal = local.hour * 60 + local.minute;

  // 1. Check if currently open
  const currentStatus = isCurrentlyOpen(config, date);
  if (currentStatus.isOpen && currentStatus.activeInterval) {
    const closesStr = formatTimeStr(currentStatus.activeInterval.closes, format);
    return {
      isOpen: true,
      stateLabel: 'OPEN',
      detailLabel: `Until ${closesStr}`
    };
  }

  // 2. Currently closed. Find when it reopens.
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const shortDays: Record<DayOfWeek, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  };

  for (let offset = 0; offset <= 7; offset++) {
    const scanDate = new Date(date);
    scanDate.setDate(date.getDate() + offset);
    
    const scanInfo = getIntervalsForDate(config, scanDate);
    const sortedIntervals = [...scanInfo.intervals].sort((a, b) => parseTimeToMinutes(a.opens) - parseTimeToMinutes(b.opens));

    for (const interval of sortedIntervals) {
      const opensTotal = parseTimeToMinutes(interval.opens);
      
      if (offset === 0 && opensTotal <= currentTotal) {
        continue;
      }

      const opensStr = formatTimeStr(interval.opens, format);
      let dayLabel = '';
      if (offset === 0) {
        dayLabel = 'today';
      } else if (offset === 1) {
        dayLabel = 'tomorrow';
      } else {
        dayLabel = `${shortDays[scanInfo.dayOfWeek]}`;
      }

      return {
        isOpen: false,
        stateLabel: 'CLOSED',
        detailLabel: `Reopens ${dayLabel} at ${opensStr}`
      };
    }
  }

  return {
    isOpen: false,
    stateLabel: 'CLOSED',
    detailLabel: 'Closed'
  };
}
