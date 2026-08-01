import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
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

export const collections = { tickets };
