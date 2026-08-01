import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const tickets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/tickets' }),
  schema: z.object({
    ticketNumber: z.string(),
    customerName: z.string(),
    ticketDate: z.string(),
    shoeDescription: z.string(),
    status: z.enum(['waiting', 'working', 'ready'])
  })
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

export const collections = { tickets, generalSettings, seoSettings };
