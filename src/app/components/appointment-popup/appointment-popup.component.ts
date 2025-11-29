import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Appointment } from '../../models';
import { TimezoneService } from '../../services/timezone.service';

/**
 * Popup component for displaying and editing appointment details
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4
 */
@Component({
  selector: 'app-appointment-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-popup.component.html',
  styleUrl: './appointment-popup.component.css'
})
export class AppointmentPopupComponent {
  @Input() appointment!: Appointment;
  @Input() isPast: boolean = false;

  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<Appointment>();
  @Output() onDelete = new EventEmitter<number>();
  @Output() onViewResults = new EventEmitter<number>();

  isEditMode: boolean = false;
  editedAppointment: Appointment | null = null;
  validationError: string | null = null;

  constructor(
    private router: Router,
    private timezoneService: TimezoneService
  ) {}

  /**
   * Enables edit mode for the appointment
   * Requirements: 4.1
   */
  editAppointment(): void {
    this.isEditMode = true;
    // Create a copy of the appointment for editing
    this.editedAppointment = { ...this.appointment };
  }

  /**
   * Saves changes to the appointment
   * Requirements: 4.1, 4.2
   */
  saveChanges(): void {
    if (!this.editedAppointment) {
      return;
    }

    // Clear previous validation errors
    this.validationError = null;

    // Validate description
    if (!this.editedAppointment.description || this.editedAppointment.description.trim().length === 0) {
      this.validationError = 'La descripción de la cita es requerida';
      return;
    }

    // Validate date format
    if (!this.editedAppointment.date || !/^\d{4}-\d{2}-\d{2}$/.test(this.editedAppointment.date)) {
      this.validationError = 'Formato de fecha inválido. Use YYYY-MM-DD';
      return;
    }

    // Validate time format
    if (!this.editedAppointment.time || !/^\d{2}:\d{2}$/.test(this.editedAppointment.time)) {
      this.validationError = 'Formato de hora inválido. Use HH:mm';
      return;
    }

    // Validate that the new date/time is in the future
    if (!this.timezoneService.isDateTimeInFuture(
      this.editedAppointment.date,
      this.editedAppointment.time
    )) {
      this.validationError = 'No se pueden agendar citas en el pasado. Por favor selecciona una fecha y hora futura.';
      return;
    }

    // Trim description
    this.editedAppointment.description = this.editedAppointment.description.trim();

    // Emit the save event with the edited appointment
    this.onSave.emit(this.editedAppointment);
    this.isEditMode = false;
    this.editedAppointment = null;
    this.validationError = null;
  }

  /**
   * Cancels edit mode without saving changes
   */
  cancelEdit(): void {
    this.isEditMode = false;
    this.editedAppointment = null;
    this.validationError = null;
  }

  /**
   * Deletes the appointment with confirmation
   * Requirements: 4.4, 4.5
   */
  deleteAppointment(): void {
    const confirmed = confirm('Are you sure you want to delete this appointment?');
    if (confirmed) {
      this.onDelete.emit(this.appointment.id);
    }
  }

  /**
   * Navigates to the results screen for this appointment
   * Requirements: 5.3, 5.4
   */
  viewResults(): void {
    this.onViewResults.emit(this.appointment.id);
    this.router.navigate(['/results', this.appointment.id]);
  }

  /**
   * Closes the popup
   * Requirements: 3.4
   */
  close(): void {
    this.isEditMode = false;
    this.editedAppointment = null;
    this.validationError = null;
    this.onClose.emit();
  }

  /**
   * Gets the appointment to display (edited version if in edit mode, otherwise original)
   */
  getDisplayAppointment(): Appointment {
    return this.isEditMode && this.editedAppointment ? this.editedAppointment : this.appointment;
  }
}
