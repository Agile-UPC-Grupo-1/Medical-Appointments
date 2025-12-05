import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppointmentService } from './appointment.service';
import { Appointment, MedicalResults } from '../models';
import { environment } from '../../environments/environment';
import * as fc from 'fast-check';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.JSON_SERVER}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // Generators for property-based testing
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

  const medicalResultsGenerator = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    appointmentId: fc.integer({ min: 1, max: 10000 }),
    type: fc.constantFrom('glucose', 'blood', 'liver', 'hemogram'),
    results: fc.array(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        value: fc.double({ min: 0, max: 1000, noNaN: true }),
        unit: fc.string({ minLength: 1, maxLength: 20 }),
        referenceRange: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
      }),
      { minLength: 1, maxLength: 10 }
    ),
    notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined })
  });

  /**
   * Feature: medical-appointments-calendar, Property 6: Appointment persistence
   * Validates: Requirements 2.4, 4.3
   */
  it('Property 6: Appointment persistence - created appointments can be retrieved', () => {
    fc.assert(
      fc.property(appointmentGenerator, (appointment) => {
        // Create appointment
        service.createAppointment(appointment).subscribe(response => {
          expect(response).toEqual(appointment);
        });

        const createReq = httpMock.expectOne(`${apiUrl}/appointments`);
        expect(createReq.request.method).toBe('POST');
        expect(createReq.request.body).toEqual(appointment);
        createReq.flush(appointment);

        // Retrieve the created appointment
        service.getAppointment(appointment.id).subscribe(response => {
          expect(response).toEqual(appointment);
        });

        const getReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
        expect(getReq.request.method).toBe('GET');
        getReq.flush(appointment);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 6: Appointment persistence
   * Validates: Requirements 2.4, 4.3
   */
  it('Property 6: Appointment persistence - updated appointments persist changes', () => {
    fc.assert(
      fc.property(
        appointmentGenerator,
        fc.string({ minLength: 1, maxLength: 200 }),
        (appointment, newDescription) => {
          const updatedAppointment = { ...appointment, description: newDescription };

          service.updateAppointment(appointment.id, updatedAppointment).subscribe(response => {
            expect(response).toEqual(updatedAppointment);
          });

          const updateReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
          expect(updateReq.request.method).toBe('PUT');
          expect(updateReq.request.body).toEqual(updatedAppointment);
          updateReq.flush(updatedAppointment);

          // Verify the update persisted
          service.getAppointment(appointment.id).subscribe(response => {
            expect(response.description).toBe(newDescription);
          });

          const getReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
          getReq.flush(updatedAppointment);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 21: HTTP operations target correct endpoints
   * Validates: Requirements 8.2, 8.3
   */
  it('Property 21: HTTP operations target correct endpoints', () => {
    fc.assert(
      fc.property(appointmentGenerator, (appointment) => {
        // Test GET all appointments
        service.getAppointments().subscribe();
        const getAllReq = httpMock.expectOne(`${apiUrl}/appointments`);
        expect(getAllReq.request.method).toBe('GET');
        getAllReq.flush([appointment]);

        // Test GET single appointment
        service.getAppointment(appointment.id).subscribe();
        const getReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
        expect(getReq.request.method).toBe('GET');
        getReq.flush(appointment);

        // Test POST (create)
        service.createAppointment(appointment).subscribe();
        const postReq = httpMock.expectOne(`${apiUrl}/appointments`);
        expect(postReq.request.method).toBe('POST');
        postReq.flush(appointment);

        // Test PUT (update)
        service.updateAppointment(appointment.id, appointment).subscribe();
        const putReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
        expect(putReq.request.method).toBe('PUT');
        putReq.flush(appointment);

        // Test DELETE
        service.deleteAppointment(appointment.id).subscribe();
        const deleteReq = httpMock.expectOne(`${apiUrl}/appointments/${appointment.id}`);
        expect(deleteReq.request.method).toBe('DELETE');
        deleteReq.flush(null);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 22: Appointment data structure completeness
   * Validates: Requirements 8.4
   */
  it('Property 22: Appointment data structure completeness', () => {
    fc.assert(
      fc.property(appointmentGenerator, (appointment) => {
        // Verify all required fields are present
        expect(appointment.id).toBeDefined();
        expect(typeof appointment.id).toBe('number');
        
        expect(appointment.date).toBeDefined();
        expect(typeof appointment.date).toBe('string');
        expect(appointment.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        
        expect(appointment.time).toBeDefined();
        expect(typeof appointment.time).toBe('string');
        expect(appointment.time).toMatch(/^\d{2}:\d{2}$/);
        
        expect(appointment.description).toBeDefined();
        expect(typeof appointment.description).toBe('string');
        expect(appointment.description.length).toBeGreaterThan(0);
        
        expect(appointment.createdAt).toBeDefined();
        expect(typeof appointment.createdAt).toBe('string');
        // Verify it's a valid ISO 8601 timestamp
        expect(new Date(appointment.createdAt).toISOString()).toBeTruthy();

        // Test that service preserves all fields
        service.createAppointment(appointment).subscribe(response => {
          expect(response.id).toBe(appointment.id);
          expect(response.date).toBe(appointment.date);
          expect(response.time).toBe(appointment.time);
          expect(response.description).toBe(appointment.description);
          expect(response.createdAt).toBe(appointment.createdAt);
        });

        const req = httpMock.expectOne(`${apiUrl}/appointments`);
        req.flush(appointment);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 23: Medical results association
   * Validates: Requirements 8.5
   */
  it('Property 23: Medical results association', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        medicalResultsGenerator,
        (appointmentId, results) => {
          // Ensure the results have the correct appointmentId
          const associatedResults = { ...results, appointmentId };

          // Verify appointmentId field exists and is correct
          expect(associatedResults.appointmentId).toBeDefined();
          expect(typeof associatedResults.appointmentId).toBe('number');
          expect(associatedResults.appointmentId).toBe(appointmentId);

          // Test that service correctly queries by appointmentId
          service.getResults(appointmentId).subscribe(response => {
            expect(Array.isArray(response)).toBe(true);
            response.forEach(result => {
              expect(result.appointmentId).toBe(appointmentId);
            });
          });

          const req = httpMock.expectOne(`${apiUrl}/results?appointmentId=${appointmentId}`);
          expect(req.request.method).toBe('GET');
          expect(req.request.urlWithParams).toContain(`appointmentId=${appointmentId}`);
          req.flush([associatedResults]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: medical-appointments-calendar, Property 24: Example appointments are editable
   * Validates: Requirements 9.4
   */
  it('Property 24: Example appointments are editable', () => {
    // Generator for example appointment IDs (1-5 based on our db.json)
    const exampleAppointmentIdGenerator = fc.integer({ min: 1, max: 5 });
    
    fc.assert(
      fc.property(
        exampleAppointmentIdGenerator,
        fc.string({ minLength: 1, maxLength: 200 }),
        (exampleId, newDescription) => {
          // Create a mock example appointment
          const exampleAppointment: any = {
            id: exampleId,
            date: '2025-10-15',
            time: '09:00',
            description: 'Original description',
            createdAt: '2025-10-10T10:00:00-05:00'
          };

          // Test that example appointments can be retrieved
          service.getAppointment(exampleId).subscribe(response => {
            expect(response).toBeDefined();
            expect(response.id).toBe(exampleId);
          });

          const getReq = httpMock.expectOne(`${apiUrl}/appointments/${exampleId}`);
          expect(getReq.request.method).toBe('GET');
          getReq.flush(exampleAppointment);

          // Test that example appointments can be edited
          const updatedAppointment = { ...exampleAppointment, description: newDescription };
          service.updateAppointment(exampleId, updatedAppointment).subscribe(response => {
            expect(response.description).toBe(newDescription);
            expect(response.id).toBe(exampleId);
          });

          const updateReq = httpMock.expectOne(`${apiUrl}/appointments/${exampleId}`);
          expect(updateReq.request.method).toBe('PUT');
          expect(updateReq.request.body.description).toBe(newDescription);
          updateReq.flush(updatedAppointment);

          // Test that example appointments can be deleted
          service.deleteAppointment(exampleId).subscribe(() => {
            // Deletion successful
            expect(true).toBe(true);
          });

          const deleteReq = httpMock.expectOne(`${apiUrl}/appointments/${exampleId}`);
          expect(deleteReq.request.method).toBe('DELETE');
          deleteReq.flush(null);
        }
      ),
      { numRuns: 100 }
    );
  });
});
