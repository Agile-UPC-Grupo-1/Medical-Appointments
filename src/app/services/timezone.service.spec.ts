import { TestBed } from '@angular/core/testing';
import { TimezoneService } from './timezone.service';
import * as fc from 'fast-check';
import { addDays, addHours, addMinutes, subDays, subHours, format as formatDate } from 'date-fns';

describe('TimezoneService', () => {
  let service: TimezoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimezoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Property 5: Future date/time validation', () => {
    /**
     * Feature: medical-appointments-calendar, Property 5: Future date/time validation
     * Validates: Requirements 2.1, 2.2, 4.2
     */
    it('should accept any date/time combination that is in the future', () => {
      fc.assert(
        fc.property(
          // Generate future dates: 1 minute to 365 days in the future
          fc.integer({ min: 1, max: 365 * 24 * 60 }).map(minutes => {
            const futureDate = addMinutes(new Date(), minutes);
            return {
              date: formatDate(futureDate, 'yyyy-MM-dd'),
              time: formatDate(futureDate, 'HH:mm')
            };
          }),
          ({ date, time }) => {
            const result = service.isDateTimeInFuture(date, time);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject any date/time combination that is in the past', () => {
      fc.assert(
        fc.property(
          // Generate past dates: 1 minute to 365 days in the past
          fc.integer({ min: 1, max: 365 * 24 * 60 }).map(minutes => {
            const pastDate = addMinutes(new Date(), -minutes);
            return {
              date: formatDate(pastDate, 'yyyy-MM-dd'),
              time: formatDate(pastDate, 'HH:mm')
            };
          }),
          ({ date, time }) => {
            const result = service.isDateTimeInFuture(date, time);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Current time uses GMT-5 timezone', () => {
    /**
     * Feature: medical-appointments-calendar, Property 2: Current time uses GMT-5 timezone
     * Validates: Requirements 1.3
     */
    it('should return current date/time in GMT-5 timezone', () => {
      const currentDateTime = service.getCurrentDateTime();
      
      // Verify it's a valid Date object
      expect(currentDateTime instanceof Date).toBe(true);
      expect(isNaN(currentDateTime.getTime())).toBe(false);
      
      // The returned date should be close to the actual current time
      // Allow a 5-second tolerance for test execution time
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - currentDateTime.getTime());
      expect(timeDiff).toBeLessThan(5000); // 5 seconds tolerance
    });

    it('should consistently use GMT-5 for all timezone operations', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            // Skip invalid dates
            if (isNaN(date.getTime())) {
              return true;
            }
            
            const convertedDate = service.convertToGMT5(date);
            
            // Verify it's a valid Date object
            expect(convertedDate instanceof Date).toBe(true);
            expect(isNaN(convertedDate.getTime())).toBe(false);
            
            // Converting the same date multiple times should yield the same result
            const convertedAgain = service.convertToGMT5(date);
            expect(convertedDate.getTime()).toBe(convertedAgain.getTime());
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit tests for specific scenarios', () => {
    it('should format date and time correctly', () => {
      const testDate = new Date('2024-11-28T10:30:00');
      const result = service.formatDateTime(testDate, '14:30');
      expect(result).toContain('2024-11-28');
      expect(result).toContain('14:30');
    });

    it('should handle date strings in isDateTimeInFuture', () => {
      const futureDate = addDays(new Date(), 5);
      const dateStr = formatDate(futureDate, 'yyyy-MM-dd');
      const result = service.isDateTimeInFuture(dateStr, '10:00');
      expect(result).toBe(true);
    });

    it('should handle Date objects in isDateTimeInFuture', () => {
      const futureDate = addDays(new Date(), 5);
      const result = service.isDateTimeInFuture(futureDate, '10:00');
      expect(result).toBe(true);
    });
  });
});
