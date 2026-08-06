export interface StatusConfig {
  label: string;
  bgColor?: string;   // Optional inline color override
  textColor?: string; // Optional inline color override
}

export type StatusConfigMap = Record<string, StatusConfig>;

export interface Ticket {
  ticketNumber: string;
  customerName: string;
  ticketDate: string;
  itemDescription: string;
  status: string;
}
