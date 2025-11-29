import { Appointment } from './appointment.model';

/**
 * Represents a single day in the calendar view
 */
export interface CalendarDay {
  date: Date;
  appointments: Appointment[];
  isCurrentMonth: boolean;
  isToday: boolean;
}
