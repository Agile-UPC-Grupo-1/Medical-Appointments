import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Appointment, MedicalResults } from '../models';
import { environment } from '../../environments/environment';

/**
 * Service for managing appointments and medical results
 * Handles all CRUD operations with JSON Server
 * Requirements: 1.2, 2.4, 4.3, 4.4, 6.1, 8.2, 8.3
 */
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly apiUrl = `${environment.JSON_SERVER}`;

  constructor(private http: HttpClient) {}

  /**
   * Handles HTTP errors with logging
   * @param operation - name of the operation that failed
   */
  private handleError(operation: string) {
    return (error: any): Observable<never> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => error);
    };
  }

  /**
   * Retrieves all appointments from the server
   * Requirements: 1.2
   */
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
      .pipe(
        catchError(this.handleError('getAppointments'))
      );
  }

  /**
   * Retrieves a specific appointment by ID
   * Requirements: 8.2
   */
  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`)
      .pipe(
        catchError(this.handleError('getAppointment'))
      );
  }

  /**
   * Creates a new appointment
   * Requirements: 2.4, 4.3, 8.3
   */
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, appointment)
      .pipe(
        catchError(this.handleError('createAppointment'))
      );
  }

  /**
   * Updates an existing appointment
   * Requirements: 4.3, 8.3
   */
  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, appointment)
      .pipe(
        catchError(this.handleError('updateAppointment'))
      );
  }

  /**
   * Deletes an appointment
   * Requirements: 4.4, 8.3
   */
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`)
      .pipe(
        catchError(this.handleError('deleteAppointment'))
      );
  }

  /**
   * Retrieves medical results for a specific appointment
   * Requirements: 6.1, 8.2
   */
  getResults(appointmentId: number): Observable<MedicalResults[]> {
    return this.http.get<MedicalResults[]>(`${this.apiUrl}/results?appointmentId=${appointmentId}`)
      .pipe(
        catchError(this.handleError('getResults'))
      );
  }
}
