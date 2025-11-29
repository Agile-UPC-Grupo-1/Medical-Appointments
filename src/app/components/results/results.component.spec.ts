import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import * as fc from 'fast-check';
import { ResultsComponent } from './results.component';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, MedicalResults, ResultItem } from '../../models';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let appointmentService: jasmine.SpyObj<AppointmentService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  // Generators for property-based testing
  const resultItemGenerator = fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    value: fc.double({ min: 0, max: 1000, noNaN: true }),
    unit: fc.string({ minLength: 1, maxLength: 20 }),
    referenceRange: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
  });

  const medicalResultsGenerator = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    appointmentId: fc.integer({ min: 1, max: 10000 }),
    type: fc.constantFrom('glucose', 'blood', 'liver', 'hemogram') as fc.Arbitrary<'glucose' | 'blood' | 'liver' | 'hemogram'>,
    results: fc.array(resultItemGenerator, { minLength: 1, maxLength: 10 }),
    notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined })
  });

  const appointmentGenerator = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    date: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2030-12-31').getTime() })
      .map(timestamp => new Date(timestamp).toISOString().split('T')[0]),
    time: fc.tuple(
      fc.integer({ min: 0, max: 23 }),
      fc.integer({ min: 0, max: 59 })
    ).map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`),
    description: fc.string({ minLength: 1, maxLength: 200 }),
    createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: Date.now() })
      .map(timestamp => new Date(timestamp).toISOString())
  });

  beforeEach(async () => {
    const appointmentServiceSpy = jasmine.createSpyObj('AppointmentService', [
      'getAppointment',
      'getResults'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [ResultsComponent, HttpClientTestingModule],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    appointmentService = TestBed.inject(AppointmentService) as jasmine.SpyObj<AppointmentService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    appointmentService.getAppointment.and.returnValue(of({} as Appointment));
    appointmentService.getResults.and.returnValue(of([]));
    expect(component).toBeTruthy();
  });

  /**
   * Feature: medical-appointments-calendar, Property 16: Results screen loads medical data
   * Validates: Requirements 6.1
   */
  it('Property 16: Results screen loads medical data', (done) => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10000 }),
        appointmentGenerator,
        fc.array(medicalResultsGenerator, { minLength: 0, maxLength: 5 }),
        async (appointmentId, appointment, results) => {
          // Ensure results have the correct appointmentId
          const associatedResults = results.map(r => ({ ...r, appointmentId }));
          const appointmentWithId = { ...appointment, id: appointmentId };

          // Setup spies
          appointmentService.getAppointment.and.returnValue(of(appointmentWithId));
          appointmentService.getResults.and.returnValue(of(associatedResults));

          // Trigger loadResults
          component.loadResults(appointmentId);

          // Wait for async operations
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify that the service methods were called with correct appointmentId
          expect(appointmentService.getAppointment).toHaveBeenCalledWith(appointmentId);
          expect(appointmentService.getResults).toHaveBeenCalledWith(appointmentId);

          // Verify that data was loaded into component
          expect(component.appointment).toEqual(appointmentWithId);
          expect(component.results).toEqual(associatedResults);
          expect(component.loading).toBe(false);
          expect(component.error).toBeNull();
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch((error) => {
      fail(error);
      done();
    });
  });

  /**
   * Feature: medical-appointments-calendar, Property 17: Medical results display all values with units
   * Validates: Requirements 6.2, 6.3, 6.4, 6.5
   */
  it('Property 17: Medical results display all values with units', () => {
    fc.assert(
      fc.property(
        resultItemGenerator,
        (resultItem) => {
          // Test formatResultValue method
          const formatted = component.formatResultValue(resultItem.value, resultItem.unit);

          // Verify the formatted string contains both value and unit
          expect(formatted).toContain(resultItem.value.toString());
          expect(formatted).toContain(resultItem.unit);

          // Verify the format is "value unit"
          expect(formatted).toBe(`${resultItem.value} ${resultItem.unit}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 17: Medical results display all values with units
   * Validates: Requirements 6.2, 6.3, 6.4, 6.5
   * 
   * This test verifies that when results are loaded, all result items maintain their
   * value and unit information for display
   */
  it('Property 17: All result types preserve value and unit information', (done) => {
    fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10000 }),
        appointmentGenerator,
        fc.array(medicalResultsGenerator, { minLength: 1, maxLength: 4 }),
        async (appointmentId, appointment, results) => {
          const associatedResults = results.map(r => ({ ...r, appointmentId }));
          const appointmentWithId = { ...appointment, id: appointmentId };

          appointmentService.getAppointment.and.returnValue(of(appointmentWithId));
          appointmentService.getResults.and.returnValue(of(associatedResults));

          component.loadResults(appointmentId);
          await new Promise(resolve => setTimeout(resolve, 10));

          // Verify all results are loaded
          expect(component.results.length).toBe(associatedResults.length);

          // Verify each result maintains all its items with values and units
          component.results.forEach((result, resultIndex) => {
            expect(result.results.length).toBe(associatedResults[resultIndex].results.length);
            
            result.results.forEach((item, itemIndex) => {
              const originalItem = associatedResults[resultIndex].results[itemIndex];
              
              // Verify value and unit are preserved
              expect(item.value).toBe(originalItem.value);
              expect(item.unit).toBe(originalItem.unit);
              expect(item.name).toBe(originalItem.name);
              
              // Verify formatResultValue works correctly for this item
              const formatted = component.formatResultValue(item.value, item.unit);
              expect(formatted).toBe(`${item.value} ${item.unit}`);
            });
          });
        }
      ),
      { numRuns: 100 }
    ).then(() => done()).catch((error) => {
      fail(error);
      done();
    });
  });

  it('should handle error when loading appointment fails', () => {
    appointmentService.getAppointment.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    appointmentService.getResults.and.returnValue(of([]));

    component.loadResults(1);

    expect(component.error).toBe('Network error');
  });

  it('should handle error when loading results fails', () => {
    appointmentService.getAppointment.and.returnValue(of({} as Appointment));
    appointmentService.getResults.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.loadResults(1);

    expect(component.error).toBe('Network error');
    expect(component.loading).toBe(false);
  });

  it('should navigate back to calendar', () => {
    component.backToCalendar();
    expect(router.navigate).toHaveBeenCalledWith(['/calendar']);
  });

  it('should return correct labels for result types', () => {
    expect(component.getResultTypeLabel('glucose')).toBe('Glucosa');
    expect(component.getResultTypeLabel('blood')).toBe('Análisis de Sangre');
    expect(component.getResultTypeLabel('liver')).toBe('Pruebas Hepáticas');
    expect(component.getResultTypeLabel('hemogram')).toBe('Hemograma Completo');
    expect(component.getResultTypeLabel('unknown')).toBe('unknown');
  });
});
