import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as fc from 'fast-check';
import { AppointmentPopupComponent } from './appointment-popup.component';
import { Appointment } from '../../models';
import { TimezoneService } from '../../services/timezone.service';

describe('AppointmentPopupComponent', () => {
  let component: AppointmentPopupComponent;
  let fixture: ComponentFixture<AppointmentPopupComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTimezoneService: jasmine.SpyObj<TimezoneService>;

  // Generator for valid appointments
  const appointmentGenerator = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    date: fc.integer({ min: 2020, max: 2030 }).chain(year =>
      fc.integer({ min: 1, max: 12 }).chain(month =>
        fc.integer({ min: 1, max: 28 }).map(day =>
          `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        )
      )
    ),
    time: fc.integer({ min: 0, max: 23 }).chain(hour =>
      fc.integer({ min: 0, max: 59 }).map(minute =>
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      )
    ),
    description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
    createdAt: fc.integer({ min: 2020, max: 2030 }).chain(year =>
      fc.integer({ min: 1, max: 12 }).chain(month =>
        fc.integer({ min: 1, max: 28 }).chain(day =>
          fc.integer({ min: 0, max: 23 }).chain(hour =>
            fc.integer({ min: 0, max: 59 }).map(minute =>
              new Date(year, month - 1, day, hour, minute).toISOString()
            )
          )
        )
      )
    )
  });

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTimezoneService = jasmine.createSpyObj('TimezoneService', ['isDateTimeInFuture']);

    await TestBed.configureTestingModule({
      imports: [AppointmentPopupComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: TimezoneService, useValue: mockTimezoneService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentPopupComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Feature: medical-appointments-calendar, Property 8: Popup displays appointment details
   * Validates: Requirements 3.1, 5.1
   */
  it('Property 8: Popup displays appointment details', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          component.isEditMode = false;
          fixture.detectChanges();

          const compiled = fixture.nativeElement;
          const descriptionElement = compiled.querySelector('.form-value');
          
          // The popup should display the appointment's description, date, and time
          expect(compiled.textContent).toContain(appointment.description);
          expect(compiled.textContent).toContain(appointment.date);
          expect(compiled.textContent).toContain(appointment.time);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 9: Future appointments show edit and delete buttons only
   * Validates: Requirements 3.2, 3.3
   */
  it('Property 9: Future appointments show edit and delete buttons only', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          component.isPast = false; // Future appointment
          component.isEditMode = false;
          fixture.detectChanges();

          const compiled = fixture.nativeElement;
          const editButton = compiled.querySelector('.btn-primary');
          const deleteButton = compiled.querySelector('.btn-danger');
          const viewResultsButton = compiled.querySelector('.btn-info');

          // Future appointments should have edit and delete buttons
          expect(editButton).toBeTruthy();
          expect(editButton?.textContent).toContain('Edit');
          expect(deleteButton).toBeTruthy();
          expect(deleteButton?.textContent).toContain('Delete');
          
          // Future appointments should NOT have view results button
          expect(viewResultsButton).toBeFalsy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 10: Past appointments show all action buttons
   * Validates: Requirements 5.2
   */
  it('Property 10: Past appointments show all action buttons', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          component.isPast = true; // Past appointment
          component.isEditMode = false;
          fixture.detectChanges();

          const compiled = fixture.nativeElement;
          const editButton = compiled.querySelector('.btn-primary');
          const deleteButton = compiled.querySelector('.btn-danger');
          const viewResultsButton = compiled.querySelector('.btn-info');

          // Past appointments should have all three buttons
          expect(editButton).toBeTruthy();
          expect(editButton?.textContent).toContain('Edit');
          expect(deleteButton).toBeTruthy();
          expect(deleteButton?.textContent).toContain('Delete');
          expect(viewResultsButton).toBeTruthy();
          expect(viewResultsButton?.textContent).toContain('View Results');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 11: Popup closure returns to calendar
   * Validates: Requirements 3.4
   */
  it('Property 11: Popup closure returns to calendar', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          fixture.detectChanges();

          let closeCalled = false;
          component.onClose.subscribe(() => {
            closeCalled = true;
          });

          // Call close method
          component.close();

          // The onClose event should be emitted
          expect(closeCalled).toBe(true);
          // Edit mode should be disabled
          expect(component.isEditMode).toBe(false);
          // Edited appointment should be cleared
          expect(component.editedAppointment).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 12: Edit mode enables field modification
   * Validates: Requirements 4.1
   */
  it('Property 12: Edit mode enables field modification', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          component.isEditMode = false;
          fixture.detectChanges();

          // Enable edit mode
          component.editAppointment();
          fixture.detectChanges();

          // Edit mode should be enabled
          expect(component.isEditMode).toBe(true);
          
          // Edited appointment should be a copy of the original
          expect(component.editedAppointment).toBeTruthy();
          expect(component.editedAppointment?.id).toBe(appointment.id);
          expect(component.editedAppointment?.description).toBe(appointment.description);
          expect(component.editedAppointment?.date).toBe(appointment.date);
          expect(component.editedAppointment?.time).toBe(appointment.time);

          // The template should show input fields
          const compiled = fixture.nativeElement;
          const descriptionInput = compiled.querySelector('#description');
          const dateInput = compiled.querySelector('#date');
          const timeInput = compiled.querySelector('#time');

          expect(descriptionInput).toBeTruthy();
          expect(dateInput).toBeTruthy();
          expect(timeInput).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 13: Delete removes appointment from system
   * Validates: Requirements 4.4
   */
  it('Property 13: Delete removes appointment from system', () => {
    // Mock the confirm dialog to return true (outside the property test)
    spyOn(window, 'confirm').and.returnValue(true);

    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          fixture.detectChanges();

          let deletedId: number | undefined = undefined;
          component.onDelete.subscribe((id: number) => {
            deletedId = id;
          });

          // Call delete
          component.deleteAppointment();

          // The onDelete event should be emitted with the appointment ID
          expect(deletedId).toBeDefined();
          expect(deletedId!).toEqual(appointment.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 14: Delete closes popup and refreshes view
   * Validates: Requirements 4.5
   */
  it('Property 14: Delete closes popup and refreshes view', () => {
    // Mock the confirm dialog to return true (outside the property test)
    spyOn(window, 'confirm').and.returnValue(true);

    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          fixture.detectChanges();

          let deleteEmitted = false;
          component.onDelete.subscribe(() => {
            deleteEmitted = true;
          });

          // Call delete
          component.deleteAppointment();

          // The onDelete event should be emitted
          // (The parent component is responsible for closing the popup and refreshing)
          expect(deleteEmitted).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 15: View results navigates with appointment ID
   * Validates: Requirements 5.3, 5.4
   */
  it('Property 15: View results navigates with appointment ID', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        (appointment: Appointment) => {
          component.appointment = appointment;
          component.isPast = true;
          fixture.detectChanges();

          let viewResultsId: number | undefined = undefined;
          component.onViewResults.subscribe((id: number) => {
            viewResultsId = id;
          });

          // Call viewResults
          component.viewResults();

          // The onViewResults event should be emitted with the appointment ID
          expect(viewResultsId).toBeDefined();
          expect(viewResultsId!).toEqual(appointment.id);
          
          // The router should navigate to the results page with the appointment ID
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/results', appointment.id]);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional unit tests for edge cases
  it('should not delete appointment when confirmation is cancelled', () => {
    const appointment: Appointment = {
      id: 1,
      date: '2024-12-01',
      time: '10:00',
      description: 'Test appointment',
      createdAt: new Date().toISOString()
    };

    component.appointment = appointment;
    fixture.detectChanges();

    let deleteEmitted = false;
    component.onDelete.subscribe(() => {
      deleteEmitted = true;
    });

    // Mock the confirm dialog to return false
    spyOn(window, 'confirm').and.returnValue(false);

    component.deleteAppointment();

    // The onDelete event should NOT be emitted
    expect(deleteEmitted).toBe(false);
  });

  it('should validate future date/time when saving changes', () => {
    const appointment: Appointment = {
      id: 1,
      date: '2024-12-01',
      time: '10:00',
      description: 'Test appointment',
      createdAt: new Date().toISOString()
    };

    component.appointment = appointment;
    component.editAppointment();
    
    // Mock isDateTimeInFuture to return false (past date)
    mockTimezoneService.isDateTimeInFuture.and.returnValue(false);
    
    let saveEmitted = false;
    component.onSave.subscribe(() => {
      saveEmitted = true;
    });

    component.saveChanges();

    // Should set validation error and not emit save event
    expect(component.validationError).toBeTruthy();
    expect(component.validationError).toContain('pasado');
    expect(saveEmitted).toBe(false);
  });

  it('should emit save event when date/time is valid', () => {
    const appointment: Appointment = {
      id: 1,
      date: '2024-12-01',
      time: '10:00',
      description: 'Test appointment',
      createdAt: new Date().toISOString()
    };

    component.appointment = appointment;
    component.editAppointment();
    
    // Mock isDateTimeInFuture to return true (future date)
    mockTimezoneService.isDateTimeInFuture.and.returnValue(true);
    
    let savedAppointment: Appointment | undefined = undefined;
    component.onSave.subscribe((apt: Appointment) => {
      savedAppointment = apt;
    });

    component.saveChanges();

    // Should emit save event with edited appointment
    expect(savedAppointment).toBeTruthy();
    expect(savedAppointment!.id).toBe(appointment.id);
    expect(component.isEditMode).toBe(false);
  });

  it('should cancel edit mode without saving', () => {
    const appointment: Appointment = {
      id: 1,
      date: '2024-12-01',
      time: '10:00',
      description: 'Test appointment',
      createdAt: new Date().toISOString()
    };

    component.appointment = appointment;
    component.editAppointment();
    
    // Modify the edited appointment
    if (component.editedAppointment) {
      component.editedAppointment.description = 'Modified description';
    }

    let saveEmitted = false;
    component.onSave.subscribe(() => {
      saveEmitted = true;
    });

    component.cancelEdit();

    // Should not emit save event
    expect(saveEmitted).toBe(false);
    expect(component.isEditMode).toBe(false);
    expect(component.editedAppointment).toBeNull();
  });
});
