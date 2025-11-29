import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Appointment, CalendarDay } from '../../models';
import { AppointmentService } from '../../services/appointment.service';
import { TimezoneService } from '../../services/timezone.service';
import { AppointmentPopupComponent } from '../appointment-popup/appointment-popup.component';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, format, addMonths, subMonths } from 'date-fns';

/**
 * Calendar component for displaying and managing medical appointments
 * Requirements: 1.1, 1.4, 1.5
 */
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, AppointmentPopupComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  appointments: Appointment[] = [];
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: CalendarDay[] = [];
  currentMonthYear: string = '';
  selectedAppointment: Appointment | null = null;
  showPopup: boolean = false;
  showCreateForm: boolean = false;
  newAppointment: { date: string; time: string; description: string } = {
    date: '',
    time: '',
    description: ''
  };
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private timezoneService: TimezoneService
  ) {}

  ngOnInit(): void {
    this.currentDate = this.timezoneService.getCurrentDateTime();
    this.loadAppointments();
  }

  /**
   * Loads all appointments from the server
   * Requirements: 1.1, 1.2
   */
  loadAppointments(): void {
    this.clearMessages();
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.generateCalendarDays();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.showError(error.message || 'No se pudieron cargar las citas. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Shows an error message to the user
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = null;
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  /**
   * Shows a success message to the user
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = null;
    // Auto-hide after 3 seconds
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  /**
   * Clears all messages
   */
  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }

  /**
   * Generates the calendar days for the current month
   * Includes days from previous and next months to fill the calendar grid
   */
  generateCalendarDays(): void {
    const monthStart = startOfMonth(this.currentDate);
    const monthEnd = endOfMonth(this.currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const today = this.timezoneService.getCurrentDateTime();

    this.calendarDays = days.map(day => {
      const dayAppointments = this.appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return isSameDay(aptDate, day);
      });

      return {
        date: day,
        appointments: dayAppointments,
        isCurrentMonth: isSameMonth(day, this.currentDate),
        isToday: isSameDay(day, today)
      };
    });

    this.currentMonthYear = format(this.currentDate, 'MMMM yyyy');
  }

  /**
   * Navigates to the next month
   * Requirements: 1.5
   */
  nextMonth(): void {
    this.currentDate = addMonths(this.currentDate, 1);
    this.generateCalendarDays();
  }

  /**
   * Navigates to the previous month
   * Requirements: 1.5
   */
  previousMonth(): void {
    this.currentDate = subMonths(this.currentDate, 1);
    this.generateCalendarDays();
  }

  /**
   * Handles click on a calendar date
   * Opens appointment creation dialog for the selected date
   * Requirements: 2.1
   */
  onDateClick(date: Date): void {
    // Check if the selected date is before today (not including today)
    const today = this.timezoneService.getCurrentDateTime();
    const selectedDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Don't open popup for dates before today
    if (selectedDateOnly < todayDateOnly) {
      this.showError('No se pueden crear citas en días pasados. Por favor selecciona el día de hoy o un día futuro.');
      return;
    }
    
    this.selectedDate = date;
    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    this.newAppointment.date = `${year}-${month}-${day}`;
    this.newAppointment.time = '09:00'; // Default time
    this.newAppointment.description = '';
    this.showCreateForm = true;
    this.clearMessages();
  }

  /**
   * Cancels the appointment creation form
   */
  cancelCreate(): void {
    this.showCreateForm = false;
    this.selectedDate = null;
    this.newAppointment = { date: '', time: '', description: '' };
    this.clearMessages();
  }

  /**
   * Submits the new appointment form
   */
  submitNewAppointment(): void {
    this.createAppointment(
      this.newAppointment.date,
      this.newAppointment.time,
      this.newAppointment.description
    );
    this.showCreateForm = false;
    this.selectedDate = null;
    this.newAppointment = { date: '', time: '', description: '' };
  }

  /**
   * Handles click on an appointment
   * Opens the appointment popup to view/edit details
   * Requirements: 3.1
   */
  onAppointmentClick(appointment: Appointment, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedAppointment = appointment;
    this.showPopup = true;
  }

  /**
   * Handles closing the popup
   */
  onPopupClose(): void {
    this.showPopup = false;
    this.selectedAppointment = null;
  }

  /**
   * Handles saving appointment changes from the popup
   */
  onPopupSave(appointment: Appointment): void {
    this.clearMessages();
    this.appointmentService.updateAppointment(appointment.id, appointment).subscribe({
      next: () => {
        console.log('Appointment updated successfully');
        this.showSuccess('Cita actualizada exitosamente');
        this.loadAppointments();
        this.onPopupClose();
      },
      error: (error) => {
        console.error('Error updating appointment:', error);
        this.showError(error.message || 'No se pudo actualizar la cita. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Handles deleting an appointment from the popup
   */
  onPopupDelete(appointmentId: number): void {
    this.clearMessages();
    this.appointmentService.deleteAppointment(appointmentId).subscribe({
      next: () => {
        console.log('Appointment deleted successfully');
        this.showSuccess('Cita eliminada exitosamente');
        this.loadAppointments();
        this.onPopupClose();
      },
      error: (error) => {
        console.error('Error deleting appointment:', error);
        this.showError(error.message || 'No se pudo eliminar la cita. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Handles view results event from popup
   */
  onPopupViewResults(appointmentId: number): void {
    // The popup component handles navigation, we just close the popup
    this.onPopupClose();
  }

  /**
   * Creates a new appointment with validation
   * Requirements: 2.1, 2.2, 2.5
   */
  createAppointment(date: string, time: string, description: string): void {
    this.clearMessages();

    // Validate description
    if (!description || description.trim().length === 0) {
      this.showError('La descripción de la cita es requerida');
      return;
    }

    // Validate that the date/time is in the future
    if (!this.timezoneService.isDateTimeInFuture(date, time)) {
      this.showError('No se pueden crear citas en el pasado. Por favor selecciona una fecha y hora futura.');
      return;
    }

    // Create the appointment object
    const newAppointment: Omit<Appointment, 'id'> = {
      date,
      time,
      description: description.trim(),
      createdAt: new Date().toISOString()
    };

    // Save to server
    this.appointmentService.createAppointment(newAppointment as Appointment).subscribe({
      next: (appointment) => {
        console.log('Appointment created successfully:', appointment);
        this.showSuccess('Cita creada exitosamente');
        // Reload appointments to update the calendar
        this.loadAppointments();
      },
      error: (error) => {
        console.error('Error creating appointment:', error);
        this.showError(error.message || 'No se pudo crear la cita. Por favor intenta nuevamente.');
      }
    });
  }

  /**
   * Determines if an appointment is in the past
   * Requirements: 1.4
   */
  isPastAppointment(appointment: Appointment): boolean {
    return !this.timezoneService.isDateTimeInFuture(appointment.date, appointment.time);
  }

  /**
   * Gets the CSS class for an appointment based on whether it's past or future
   * Requirements: 1.4
   */
  getAppointmentClass(appointment: Appointment): string {
    return this.isPastAppointment(appointment) ? 'past-appointment' : 'future-appointment';
  }
}
