import type { OpeningHoursConfig, DayOfWeek } from './types.js';

const schemaDayMap: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const padTime = (t: string) => {
  const [h, m] = t.split(':');
  return `${h.padStart(2, '0')}:${m}`;
};

/**
 * Generates Schema.org local business JSON-LD structure with opening hours specification.
 */
export function generateOpeningHoursSchema(
  config: OpeningHoursConfig,
  businessName?: string,
  businessType: string = 'LocalBusiness'
) {
  const spec: any[] = [];

  // 1. Map regular weekly hours
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of days) {
    const intervals = config.regularHours[day] || [];
    for (const interval of intervals) {
      spec.push({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': schemaDayMap[day],
        'opens': padTime(interval.opens),
        'closes': padTime(interval.closes)
      });
    }
  }

  // 2. Map special date overrides (holidays, special closures, modified hours)
  if (config.specialDates && config.specialDates.length > 0) {
    for (const rule of config.specialDates) {
      if (rule.intervals.length === 0) {
        // Schema.org standard: opens: "00:00", closes: "00:00" on a valid range indicates closed all day.
        spec.push({
          '@type': 'OpeningHoursSpecification',
          'validFrom': rule.date,
          'validThrough': rule.date,
          'opens': '00:00',
          'closes': '00:00'
        });
      } else {
        for (const interval of rule.intervals) {
          spec.push({
            '@type': 'OpeningHoursSpecification',
            'validFrom': rule.date,
            'validThrough': rule.date,
            'opens': padTime(interval.opens),
            'closes': padTime(interval.closes)
          });
        }
      }
    }
  }

  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': businessType,
    'openingHoursSpecification': spec
  };

  if (businessName) {
    jsonLd.name = businessName;
  }

  return jsonLd;
}
export type OpeningHoursJsonLd = ReturnType<typeof generateOpeningHoursSchema>;
