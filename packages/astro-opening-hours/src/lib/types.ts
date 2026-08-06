export interface TimeInterval {
  opens: string;  // Format: "HH:MM" (24h, e.g., "09:00")
  closes: string; // Format: "HH:MM" (24h, e.g., "17:00")
}

export type DayOfWeek = 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday' 
  | 'saturday' 
  | 'sunday';

export type RegularHours = {
  [key in DayOfWeek]?: TimeInterval[];
};

export interface SpecialDateRule {
  date: string;              // Format: "YYYY-MM-DD"
  intervals: TimeInterval[]; // Empty array means closed
  label?: string;            // e.g., "Thanksgiving Day"
}

export interface OpeningHoursConfig {
  timezone: string;          // IANA timezone string, e.g., "America/New_York"
  regularHours: RegularHours;
  specialDates?: SpecialDateRule[];
}
