# Configuración de Rutas - Medical Appointments Calendar

## Estructura de Rutas

La aplicación utiliza Angular Router con las siguientes rutas configuradas:

### Rutas Principales

1. **`/` (Raíz)**
   - Redirige automáticamente a `/calendar`
   - Asegura que los usuarios siempre vean contenido al acceder a la aplicación

2. **`/calendar`**
   - Componente: `CalendarComponent`
   - Título: "Calendario de Citas"
   - Muestra el calendario interactivo con todas las citas médicas
   - Permite crear, editar y eliminar citas

3. **`/results/:id`**
   - Componente: `ResultsComponent`
   - Título: "Resultados Médicos"
   - Muestra los resultados médicos de una cita específica
   - El parámetro `:id` es el ID de la cita

4. **`/results`**
   - Componente: `ResultsComponent`
   - Título: "Resultados Médicos"
   - Muestra la pantalla de resultados sin una cita específica
   - Útil para acceso directo desde la navegación

5. **`/**` (Wildcard)**
   - Redirige a `/calendar`
   - Maneja rutas no encontradas (404)

## Navegación

### Pestañas de Navegación

La aplicación tiene dos pestañas principales siempre visibles:

- **Calendario**: Navega a `/calendar`
- **Resultados**: Navega a `/results`

### Características de Navegación

- **RouterLinkActive**: Las pestañas activas se resaltan automáticamente
- **Accesibilidad**: Incluye atributos ARIA para lectores de pantalla
- **Títulos de Página**: Cada ruta tiene un título descriptivo

## Flujos de Navegación

### Flujo 1: Ver Resultados desde Cita Pasada
```
Calendar → Click en cita pasada → Popup → "Ver Resultados" → /results/:id
```

### Flujo 2: Navegación Directa a Resultados
```
Cualquier pantalla → Click en pestaña "Resultados" → /results
```

### Flujo 3: Volver al Calendario
```
Results → Click en pestaña "Calendario" → /calendar
```

## Implementación Técnica

### Componentes Standalone

Todos los componentes son standalone y se importan directamente:

```typescript
import { CalendarComponent, ResultsComponent } from './components';
```

### Barrel Exports

Se utiliza un archivo `index.ts` en la carpeta `components` para simplificar las importaciones:

```typescript
// src/app/components/index.ts
export { CalendarComponent } from './calendar/calendar.component';
export { ResultsComponent } from './results/results.component';
export { AppointmentPopupComponent } from './appointment-popup/appointment-popup.component';
```

### Configuración de Rutas

```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/calendar', pathMatch: 'full' },
  { path: 'calendar', component: CalendarComponent, title: 'Calendario de Citas' },
  { path: 'results/:id', component: ResultsComponent, title: 'Resultados Médicos' },
  { path: 'results', component: ResultsComponent, title: 'Resultados Médicos' },
  { path: '**', redirectTo: '/calendar' }
];
```

## Requisitos Cumplidos

- **7.1**: Las pestañas de navegación son siempre visibles
- **7.2**: Click en pestaña de calendario muestra la pantalla de calendario
- **7.3**: Click en pestaña de resultados muestra la pantalla de resultados
- **7.4**: La navegación mantiene el estado de los datos cargados

## Mejoras Implementadas

1. **Títulos de Página**: Cada ruta tiene un título descriptivo para SEO y accesibilidad
2. **Manejo de 404**: Rutas no encontradas redirigen al calendario
3. **Barrel Exports**: Importaciones simplificadas y organizadas
4. **Accesibilidad**: Atributos ARIA en los enlaces de navegación
5. **RouterLinkActiveOptions**: Control preciso del estado activo de los enlaces
