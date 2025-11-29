# Lógica de Citas Pasadas vs Futuras

## Resumen

El sistema determina automáticamente si una cita es **pasada** o **futura** basándose en la zona horaria **GMT-5** y muestra u oculta el botón "Ver Resultados" según corresponda.

---

## Flujo de Determinación

### 1. Zona Horaria GMT-5 (TimezoneService)

```typescript
// medical-appointments/src/app/services/timezone.service.ts
private readonly timezone = 'America/Bogota'; // GMT-5

getCurrentDateTime(): Date {
  const now = new Date();
  return toZonedTime(now, this.timezone);
}

isDateTimeInFuture(date: string | Date, time: string): boolean {
  // Convierte la fecha/hora de la cita a GMT-5
  // Compara con el momento actual en GMT-5
  // Retorna true si la cita es DESPUÉS del momento actual
  return isAfter(dateTimeInGMT5, currentDateTime);
}
```

### 2. Clasificación en el Calendario (CalendarComponent)

```typescript
// medical-appointments/src/app/components/calendar/calendar.component.ts
isPastAppointment(appointment: Appointment): boolean {
  // Usa TimezoneService para verificar si la cita es pasada
  return !this.timezoneService.isDateTimeInFuture(
    appointment.date, 
    appointment.time
  );
}
```

### 3. Paso al Popup

```html
<!-- medical-appointments/src/app/components/calendar/calendar.component.html -->
<app-appointment-popup
  *ngIf="showPopup && selectedAppointment"
  [appointment]="selectedAppointment"
  [isPast]="isPastAppointment(selectedAppointment)"
  (onClose)="onPopupClose()"
  (onSave)="onPopupSave($event)"
  (onDelete)="onPopupDelete($event)"
  (onViewResults)="onPopupViewResults($event)">
</app-appointment-popup>
```

### 4. Renderizado Condicional del Botón (AppointmentPopupComponent)

```html
<!-- medical-appointments/src/app/components/appointment-popup/appointment-popup.component.html -->
<div *ngIf="!isEditMode" class="action-buttons">
  <button class="btn btn-primary" (click)="editAppointment()">Edit</button>
  <button class="btn btn-danger" (click)="deleteAppointment()">Delete</button>
  
  <!-- ⭐ BOTÓN "VER RESULTADOS" SOLO PARA CITAS PASADAS -->
  <button *ngIf="isPast" class="btn btn-info" (click)="viewResults()">
    View Results
  </button>
</div>
```

---

## Ejemplos Prácticos

### Escenario 1: Cita Futura
**Fecha actual (GMT-5):** 29 de noviembre de 2025, 15:00
**Cita:** 5 de diciembre de 2025, 10:00

```
isDateTimeInFuture("2025-12-05", "10:00") → true
isPastAppointment() → false
Botón "Ver Resultados" → ❌ NO SE MUESTRA
```

**Botones visibles:**
- ✅ Editar
- ✅ Eliminar
- ❌ Ver Resultados (oculto)

---

### Escenario 2: Cita Pasada
**Fecha actual (GMT-5):** 29 de noviembre de 2025, 15:00
**Cita:** 15 de noviembre de 2025, 09:15

```
isDateTimeInFuture("2025-11-15", "09:15") → false
isPastAppointment() → true
Botón "Ver Resultados" → ✅ SE MUESTRA
```

**Botones visibles:**
- ✅ Editar
- ✅ Eliminar
- ✅ Ver Resultados (visible)

---

### Escenario 3: Cita del Mismo Día (Hora Pasada)
**Fecha actual (GMT-5):** 29 de noviembre de 2025, 15:00
**Cita:** 29 de noviembre de 2025, 08:45

```
isDateTimeInFuture("2025-11-29", "08:45") → false
isPastAppointment() → true
Botón "Ver Resultados" → ✅ SE MUESTRA
```

**Botones visibles:**
- ✅ Editar
- ✅ Eliminar
- ✅ Ver Resultados (visible)

---

### Escenario 4: Cita del Mismo Día (Hora Futura)
**Fecha actual (GMT-5):** 29 de noviembre de 2025, 15:00
**Cita:** 29 de noviembre de 2025, 18:00

```
isDateTimeInFuture("2025-11-29", "18:00") → true
isPastAppointment() → false
Botón "Ver Resultados" → ❌ NO SE MUESTRA
```

**Botones visibles:**
- ✅ Editar
- ✅ Eliminar
- ❌ Ver Resultados (oculto)

---

## Validaciones Adicionales

### Creación de Citas
Al crear una nueva cita, el sistema valida:

```typescript
// No permite crear citas en el pasado
if (!this.timezoneService.isDateTimeInFuture(date, time)) {
  this.showError('No se pueden crear citas en el pasado...');
  return;
}
```

### Edición de Citas
Al editar una cita existente, el sistema valida:

```typescript
// No permite cambiar una cita a una fecha/hora pasada
if (!this.timezoneService.isDateTimeInFuture(
  this.editedAppointment.date,
  this.editedAppointment.time
)) {
  this.validationError = 'No se pueden agendar citas en el pasado...';
  return;
}
```

---

## Cómo Probar

### Prueba 1: Cita Futura (Sin Botón de Resultados)
1. Navegar a **Diciembre 2025**
2. Hacer clic en la cita del **5 de diciembre** (ID 13)
3. **Verificar:** Solo aparecen botones "Edit" y "Delete"
4. **Verificar:** NO aparece el botón "View Results"

### Prueba 2: Cita Pasada (Con Botón de Resultados)
1. Navegar a **Noviembre 2025**
2. Hacer clic en la cita del **15 de noviembre** (ID 8)
3. **Verificar:** Aparecen botones "Edit", "Delete" y "View Results"
4. **Verificar:** El botón "View Results" es visible y funcional

### Prueba 3: Cita del Día Actual
1. Crear una cita para **HOY** con una hora que ya pasó (ej: 08:00)
2. Hacer clic en la cita
3. **Verificar:** Aparece el botón "View Results" (es cita pasada)

4. Crear una cita para **HOY** con una hora futura (ej: 23:00)
5. Hacer clic en la cita
6. **Verificar:** NO aparece el botón "View Results" (es cita futura)

---

## Datos de Prueba en db.json

### Citas Futuras (Sin botón "Ver Resultados"):
- **ID 13:** 5 de diciembre de 2025, 10:00
- **ID 14:** 15 de diciembre de 2025, 16:00

### Citas Pasadas (Con botón "Ver Resultados"):
- **ID 1-12:** Todas las citas de junio a noviembre 2025

---

## Conclusión

✅ **La funcionalidad está completamente implementada**

El sistema:
1. ✅ Usa GMT-5 para todas las comparaciones de fecha/hora
2. ✅ Determina automáticamente si una cita es pasada o futura
3. ✅ Muestra el botón "Ver Resultados" SOLO en citas pasadas
4. ✅ Oculta el botón "Ver Resultados" en citas futuras
5. ✅ Valida que no se puedan crear citas en el pasado
6. ✅ Valida que no se puedan editar citas a fechas pasadas

**No se requieren cambios adicionales en el código.**
