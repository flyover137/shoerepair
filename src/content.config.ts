import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { openingHoursConfigSchema } from 'astro-opening-hours';
import { ticketSchema } from 'astro-progress-tracker';

const tickets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tickets' }),
  schema: ticketSchema
});

const generalSettings = defineCollection({
  loader: file("src/content/settings/general.json"),
  schema: z.object({
    brandName: z.string(),
    subtitle: z.string(),
    footerText: z.string()
  })
});

const seoSettings = defineCollection({
  loader: file("src/content/settings/seo.json"),
  schema: z.object({
    seoTitle: z.string(),
    seoDescription: z.string()
  })
});

const openingHoursSettings = defineCollection({
  loader: file("src/content/settings/opening-hours.json"),
  schema: openingHoursConfigSchema
});

export const collections = { tickets, generalSettings, seoSettings, openingHoursSettings };

