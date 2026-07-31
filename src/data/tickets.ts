import rawTickets from './tickets.json';

export interface Ticket {
  ticketNumber: string;
  ticketDate: string;
  shoeDescription: string;
  status: 'waiting' | 'working' | 'ready';
}

export const tickets = rawTickets as Ticket[];
