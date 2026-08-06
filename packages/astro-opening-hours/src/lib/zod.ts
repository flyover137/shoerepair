import { z } from 'zod';

const timeStrSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: "Time must be in 24-hour HH:MM format (e.g., '09:30' or '17:00')"
});

export const timeIntervalSchema = z.object({
  opens: timeStrSchema,
  closes: timeStrSchema
});

export const dayScheduleSchema = z.array(timeIntervalSchema);

export const regularHoursSchema = z.object({
  monday: dayScheduleSchema.optional().default([]),
  tuesday: dayScheduleSchema.optional().default([]),
  wednesday: dayScheduleSchema.optional().default([]),
  thursday: dayScheduleSchema.optional().default([]),
  friday: dayScheduleSchema.optional().default([]),
  saturday: dayScheduleSchema.optional().default([]),
  sunday: dayScheduleSchema.optional().default([])
});

export const specialDateRuleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format"
  }),
  intervals: dayScheduleSchema,
  label: z.string().optional()
});

export const openingHoursConfigSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  regularHours: regularHoursSchema,
  specialDates: z.array(specialDateRuleSchema).optional().default([])
});
