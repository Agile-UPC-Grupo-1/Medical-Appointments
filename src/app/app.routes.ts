import { Routes } from '@angular/router';
import { CalendarComponent, ResultsComponent } from './components';

/**
 * Application routes configuration
 * 
 * Routes:
 * - '' (root): Redirects to calendar
 * - 'calendar': Main calendar view showing all appointments
 * - 'results': Results view without specific appointment (shows message)
 * - 'results/:id': Results view for a specific appointment ID
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/calendar', 
    pathMatch: 'full' 
  },
  { 
    path: 'calendar', 
    component: CalendarComponent,
    title: 'Calendario de Citas'
  },
  { 
    path: 'results/:id', 
    component: ResultsComponent,
    title: 'Resultados Médicos'
  },
  { 
    path: 'results', 
    component: ResultsComponent,
    title: 'Resultados Médicos'
  },
  {
    path: '**',
    redirectTo: '/calendar'
  }
];
