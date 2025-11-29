import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment, MedicalResults } from '../../models';

/**
 * Component for displaying medical results of an appointment
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})
export class ResultsComponent implements OnInit {
  appointmentId: number | null = null;
  appointment: Appointment | null = null;
  results: MedicalResults[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.appointmentId = params['id'] ? +params['id'] : null;
      if (this.appointmentId) {
        this.loadResults(this.appointmentId);
      }
    });
  }

  /**
   * Loads medical results for the specified appointment
   * Requirements: 6.1
   */
  loadResults(appointmentId: number): void {
    this.loading = true;
    this.error = null;
    this.results = [];
    this.appointment = null;

    // Load appointment details
    this.appointmentService.getAppointment(appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        // Only clear error if we successfully loaded the appointment
        if (this.error && this.error.includes('cita')) {
          this.error = null;
        }
      },
      error: (err) => {
        console.error('Error loading appointment:', err);
        // Only set error if we don't have results yet
        if (this.results.length === 0) {
          this.error = 'No se encontró la información solicitada';
        }
        this.loading = false;
      }
    });

    // Load medical results
    this.appointmentService.getResults(appointmentId).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
        // Clear any previous errors if we successfully loaded results
        if (this.results.length > 0) {
          this.error = null;
        }
      },
      error: (err) => {
        console.error('Error loading results:', err);
        // Only show error if we also don't have appointment info
        if (!this.appointment) {
          this.error = 'No se encontró la información solicitada';
        }
        this.loading = false;
      }
    });
  }

  /**
   * Formats a result value with its unit
   * Requirements: 6.2, 6.3, 6.4, 6.5
   */
  formatResultValue(value: number, unit: string): string {
    return `${value} ${unit}`;
  }

  /**
   * Returns to the calendar view
   */
  backToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  /**
   * Gets a user-friendly label for the result type
   */
  getResultTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'glucose': 'Glucosa',
      'blood': 'Análisis de Sangre',
      'liver': 'Pruebas Hepáticas',
      'hemogram': 'Hemograma Completo'
    };
    return labels[type] || type;
  }
}
