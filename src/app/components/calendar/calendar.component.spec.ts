import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { AppointmentService } from '../../services/appointment.service';
import { TimezoneService } from '../../services/timezone.service';
import { of } from 'rxjs';
import * as fc from 'fast-check';
import { Appointment } from '../../models';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let timezoneService: jasmine.SpyObj<TimezoneService>;

  beforeEach(async () => {
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', ['getAppointments', 'createAppointment']);
    const timezoneServiceSpy = jasmine.createSpyObj('TimezoneService', ['getCurrentDateTime', 'isDateTimeInFuture']);

    await TestBed.configureTestingModule({
      imports: [CalendarComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: TimezoneService, useValue: timezoneServiceSpy }
      ]
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    timezoneService = TestBed.inject(TimezoneService) as jasmine.SpyObj<TimezoneService>;
    
    // Default mock behavior
    timezoneService.getCurrentDateTime.and.returnValue(new Date('2024-11-28T10:00:00-05:00'));
    
    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    appointmentService.getAppointments.and.returnValue(of([]));
    expect(component).toBeTruthy();
  });

  /**
   * Feature: medical-appointments-calendar, Property 1: Calendar loads all appointments from server
   * Validates: Requirements 1.1, 1.2
   */
  it('Property 1: Calendar loads all appointments from server', () => {
    // Generator for valid appointments
    const appointmentGenerator = fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      date: fc.integer({ min: 2024, max: 2025 }).chain(year =>
        fc.integer({ min: 1, max: 12 }).chain(month =>
          fc.integer({ min: 1, max: 28 }).map(day =>
            `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
          )
        )
      ),
      time: fc.integer({ min: 0, max: 23 }).chain(hour =>
        fc.integer({ min: 0, max: 59 }).map(minute =>
          `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        )
      ),
      description: fc.string({ minLength: 1, maxLength: 100 }),
      createdAt: fc.integer({ min: 2024, max: 2025 }).chain(year =>
        fc.integer({ min: 1, max: 12 }).chain(month =>
          fc.integer({ min: 1, max: 28 }).chain(day =>
            fc.integer({ min: 0, max: 23 }).chain(hour =>
              fc.integer({ min: 0, max: 59 }).map(minute =>
                `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00-05:00`
              )
            )
          )
        )
      )
    });

    fc.assert(
      fc.property(
        fc.array(appointmentGenerator, { minLength: 0, maxLength: 20 }),
        (appointments) => {
          // Setup: Mock the service to return the generated appointments
          appointmentService.getAppointments.and.returnValue(of(appointments));
          
          // Execute: Load appointments
          component.loadAppointments();
          
          // Verify: All appointments from server are loaded into component
          expect(component.appointments.length).toBe(appointments.length);
          expect(component.appointments).toEqual(appointments);
          
          // Verify: Service was called
          expect(appointmentService.getAppointments).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 3: Visual distinction between past and future appointments
   * Validates: Requirements 1.4
   */
  it('Property 3: Visual distinction between past and future appointments', () => {
    const currentDateTime = new Date('2024-11-28T10:00:00-05:00');
    timezoneService.getCurrentDateTime.and.returnValue(currentDateTime);

    // Generator for appointments with known past/future status
    const pastAppointmentGenerator = fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      date: fc.constantFrom('2024-11-20', '2024-11-25', '2024-11-27'),
      time: fc.constantFrom('08:00', '09:30', '14:00'),
      description: fc.string({ minLength: 1, maxLength: 100 }),
      createdAt: fc.constant('2024-11-01T10:00:00-05:00')
    });

    const futureAppointmentGenerator = fc.record({
      id: fc.integer({ min: 1, max: 10000 }),
      date: fc.constantFrom('2024-11-29', '2024-12-01', '2024-12-15'),
      time: fc.constantFrom('10:00', '15:30', '18:00'),
      description: fc.string({ minLength: 1, maxLength: 100 }),
      createdAt: fc.constant('2024-11-01T10:00:00-05:00')
    });

    fc.assert(
      fc.property(
        pastAppointmentGenerator,
        futureAppointmentGenerator,
        (pastApt, futureApt) => {
          // Mock the timezone service to return consistent results
          timezoneService.isDateTimeInFuture.and.callFake((date: string, time: string) => {
            const aptDateTime = new Date(`${date}T${time}:00-05:00`);
            return aptDateTime > currentDateTime;
          });

          // Verify: Past appointment has 'past-appointment' class
          const pastClass = component.getAppointmentClass(pastApt);
          expect(pastClass).toBe('past-appointment');
          expect(component.isPastAppointment(pastApt)).toBe(true);

          // Verify: Future appointment has 'future-appointment' class
          const futureClass = component.getAppointmentClass(futureApt);
          expect(futureClass).toBe('future-appointment');
          expect(component.isPastAppointment(futureApt)).toBe(false);

          // Verify: Classes are different
          expect(pastClass).not.toBe(futureClass);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 4: Calendar navigation updates displayed month
   * Validates: Requirements 1.5
   */
  it('Property 4: Calendar navigation updates displayed month', () => {
    appointmentService.getAppointments.and.returnValue(of([]));

    // Generator for starting months
    const monthGenerator = fc.record({
      year: fc.integer({ min: 2024, max: 2025 }),
      month: fc.integer({ min: 0, max: 11 }) // 0-11 for JavaScript Date months
    });

    fc.assert(
      fc.property(
        monthGenerator,
        (startMonth) => {
          // Setup: Set initial date
          component.currentDate = new Date(startMonth.year, startMonth.month, 15);
          const initialMonth = component.currentDate.getMonth();
          const initialYear = component.currentDate.getFullYear();
          
          component.generateCalendarDays();

          // Test nextMonth
          component.nextMonth();
          const afterNextMonth = component.currentDate.getMonth();
          const afterNextYear = component.currentDate.getFullYear();

          // Verify: Month advanced by 1 (handling year rollover)
          if (initialMonth === 11) {
            expect(afterNextMonth).toBe(0);
            expect(afterNextYear).toBe(initialYear + 1);
          } else {
            expect(afterNextMonth).toBe(initialMonth + 1);
            expect(afterNextYear).toBe(initialYear);
          }

          // Test previousMonth (going back to original)
          component.previousMonth();
          const afterPrevMonth = component.currentDate.getMonth();
          const afterPrevYear = component.currentDate.getFullYear();

          // Verify: Back to original month
          expect(afterPrevMonth).toBe(initialMonth);
          expect(afterPrevYear).toBe(initialYear);

          // Test previousMonth from initial position
          component.previousMonth();
          const finalMonth = component.currentDate.getMonth();
          const finalYear = component.currentDate.getFullYear();

          // Verify: Month decreased by 1 (handling year rollover)
          if (initialMonth === 0) {
            expect(finalMonth).toBe(11);
            expect(finalYear).toBe(initialYear - 1);
          } else {
            expect(finalMonth).toBe(initialMonth - 1);
            expect(finalYear).toBe(initialYear);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 7: Past date rejection
   * Validates: Requirements 2.5
   */
  it('Property 7: Past date rejection', () => {
    const currentDateTime = new Date('2024-11-28T10:00:00-05:00');
    timezoneService.getCurrentDateTime.and.returnValue(currentDateTime);
    appointmentService.getAppointments.and.returnValue(of([]));

    // Spy on console.error once before the property test
    spyOn(console, 'error');

    // Generator for past dates (dates before current time)
    const pastDateGenerator = fc.record({
      date: fc.constantFrom('2024-11-20', '2024-11-25', '2024-11-27', '2024-11-28'),
      time: fc.constantFrom('08:00', '09:00', '09:30'),
      description: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
    });

    fc.assert(
      fc.property(
        pastDateGenerator,
        (pastAppointment) => {
          // Mock the timezone service to correctly identify past dates
          timezoneService.isDateTimeInFuture.and.callFake((date: string, time: string) => {
            const aptDateTime = new Date(`${date}T${time}:00-05:00`);
            return aptDateTime > currentDateTime;
          });

          // Store initial appointments count
          const initialAppointmentsCount = component.appointments.length;

          // Reset the spy calls before each test
          appointmentService.createAppointment.calls.reset();

          // Attempt to create appointment with past date
          component.createAppointment(
            pastAppointment.date,
            pastAppointment.time,
            pastAppointment.description
          );

          // Verify: Error message was set
          expect(component.errorMessage).toBeTruthy();
          expect(component.errorMessage).toContain('pasado');

          // Verify: createAppointment service method was NOT called
          expect(appointmentService.createAppointment).not.toHaveBeenCalled();

          // Verify: Appointments list remains unchanged
          expect(component.appointments.length).toBe(initialAppointmentsCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
