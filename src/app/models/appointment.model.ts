/**
 * Represents a medical appointment in the system
 * Requirements: 8.4
 */
export interface Appointment {
  id: number;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm
  description: string;
  createdAt: string; // ISO 8601 timestamp
}
