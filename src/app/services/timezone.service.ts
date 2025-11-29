import { Injectable } from '@angular/core';
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';
import { parseISO, parse, isAfter } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class TimezoneService {
  private readonly timezone = 'America/Bogota'; // GMT-5

  /**
   * Gets the current date and time in GMT-5 timezone
   * @returns Current date/time in GMT-5
   */
  getCurrentDateTime(): Date {
    const now = new Date();
    return toZonedTime(now, this.timezone);
  }

  /**
   * Validates if a given date and time combination is in the future
   * @param date Date string in YYYY-MM-DD format or Date object
   * @param time Time string in HH:mm format
   * @returns true if the date/time is after the current GMT-5 moment
   */
  isDateTimeInFuture(date: string | Date, time: string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const dateTimeString = `${format(dateObj, 'yyyy-MM-dd', { timeZone: this.timezone })} ${time}`;
    const dateTime = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());
    const dateTimeInGMT5 = toZonedTime(fromZonedTime(dateTime, this.timezone), this.timezone);
    const currentDateTime = this.getCurrentDateTime();
    
    return isAfter(dateTimeInGMT5, currentDateTime);
  }

  /**
   * Converts a date to GMT-5 timezone
   * @param date Date to convert
   * @returns Date in GMT-5 timezone
   */
  convertToGMT5(date: Date): Date {
    return toZonedTime(date, this.timezone);
  }

  /**
   * Formats a date and time for display
   * @param date Date to format
   * @param time Time string in HH:mm format
   * @returns Formatted date/time string
   */
  formatDateTime(date: Date, time: string): string {
    const dateStr = format(date, 'yyyy-MM-dd', { timeZone: this.timezone });
    return `${dateStr} ${time}`;
  }
}
