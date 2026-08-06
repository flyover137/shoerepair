import { z } from 'zod';

export const ticketSchema = z.object({
  ticketNumber: z.string(),
  customerName: z.string(),
  ticketDate: z.string(),
  itemDescription: z.string(),
  status: z.string()
});
