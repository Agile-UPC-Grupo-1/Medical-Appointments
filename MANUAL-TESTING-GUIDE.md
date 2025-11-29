# Guía de Pruebas Manuales de Integración

## Configuración Inicial

**Servidores en ejecución:**
- JSON Server: http://localhost:3000/
- Angular App: http://localhost:4201/

## Cómo Crear una Cita

Para crear una nueva cita en el calendario:

1. **Hacer clic en un día del calendario:**
   - ❌ **Días pasados:** NO se abre el popup, verás un mensaje de error
   - ✅ **Día actual (hoy):** SÍ se abre el popup, pero debes ingresar una hora futura
   - ✅ **Días futuros:** SÍ se abre el popup sin restricciones

2. Si el popup se abre, verás un **formulario** con tres campos:
   - **Fecha:** Pre-llenada con el día que seleccionaste
   - **Hora:** Por defecto 09:00 (puedes cambiarla)
   - **Descripción:** Campo vacío para que ingreses el motivo de la cita

3. Completar los campos y hacer clic en **"CREAR CITA"** (botón verde grande)

4. Validaciones:
   - Si la fecha/hora es futura → ✅ Cita se crea exitosamente
   - Si la fecha/hora es pasada → ❌ Mensaje de error
   - Si la descripción está vacía → ❌ Mensaje de error

**Nota:** Solo puedes crear citas con fecha y hora **futuras** (después del momento actual en GMT-5).

---

## Estado de los Datos

El sistema tiene **14 citas** distribuidas en diferentes meses:
- **Citas pasadas** (antes de hoy): IDs 1-11 (de junio a noviembre 2025)
- **Citas futuras** (después de hoy): IDs 13-14 (diciembre 2025)

### Citas en Noviembre 2025 (7 citas):
1. **ID 6** - 5 nov, 08:00 - Chequeo general de rutina ✅ Con resultados
2. **ID 7** - 10 nov, 10:30 - Examen de tiroides ✅ Con resultados
3. **ID 8** - 15 nov, 09:15 - Control de presión arterial ✅ Con resultados
4. **ID 9** - 18 nov, 14:00 - Análisis de orina completo ✅ Con resultados
5. **ID 10** - 22 nov, 11:00 - Perfil lipídico completo ✅ Con resultados
6. **ID 11** - 25 nov, 15:30 - Hemograma de control ✅ Con resultados
7. **ID 12** - 28 nov, 08:45 - Examen de glucosa en ayunas ❌ Sin resultados

---

## Flujo 1: Crear Cita Futura → Ver en Calendario

### Objetivo
Verificar que se puede crear una nueva cita con fecha futura y que aparece correctamente en el calendario.

### Pasos:
1. Abrir http://localhost:4201/
2. Navegar al mes de **Diciembre 2025** usando las flechas del calendario
3. **Hacer clic en un día vacío** (ej: 20 de diciembre) - Se abrirá un formulario popup
4. En el formulario "Nueva Cita":
   - **Fecha:** Se pre-llena automáticamente con el día seleccionado (2025-12-20)
   - **Hora:** Cambiar a "14:00" (por defecto es 09:00)
   - **Descripción:** Ingresar "Consulta de control general"
5. Hacer clic en el botón **"Crear Cita"**
6. Verificar que aparece un mensaje de éxito en verde: "Cita creada exitosamente"
7. Verificar que la nueva cita aparece en el calendario en el día 20
8. Hacer clic en la cita recién creada para ver sus detalles

### Resultado Esperado:
✅ Al hacer clic en un día, se abre el formulario de creación
✅ La fecha se pre-llena automáticamente
✅ La cita se crea exitosamente
✅ Aparece mensaje de éxito en verde
✅ La cita aparece en el calendario con estilo de cita futura (color verde)
✅ Al hacer clic en la cita, se abre el popup con los detalles correctos
✅ El popup muestra solo botones "Edit" y "Delete" (NO "View Results")

---

## Flujo 2: Hacer Clic en Cita Pasada → Ver Resultados

### Objetivo
Verificar que al hacer clic en una cita pasada se pueden ver sus resultados médicos.

### Pasos:
1. En el calendario, navegar a **Noviembre 2025**
2. Hacer clic en la cita del **15 de noviembre** (Control de presión arterial)
3. En el popup que se abre, verificar que aparecen 3 botones:
   - ✏️ Editar
   - 🗑️ Eliminar
   - 📊 Ver Resultados
4. Hacer clic en "Ver Resultados"
5. Verificar que se navega a la pantalla de resultados
6. Verificar que se muestra:
   - Información de la cita (descripción, fecha, hora)
   - Tabla con resultados de "Análisis de Sangre"
   - Valores: Presión sistólica (118 mmHg), Presión diastólica (76 mmHg), Frecuencia cardíaca (72 lpm)
   - Notas: "Presión arterial óptima"

### Resultado Esperado:
✅ El popup muestra los 3 botones correctamente
✅ La navegación a resultados funciona
✅ Los resultados se muestran con todos los valores y unidades
✅ **NO aparece el mensaje de error** "No se encontró la información solicitada"

---

## Flujo 3: Editar Cita → Guardar → Verificar Cambios

### Objetivo
Verificar que se puede editar una cita existente y los cambios se persisten.

### Pasos:
1. En el calendario de **Noviembre 2025**, hacer clic en la cita del **28 de noviembre** (Examen de glucosa)
2. En el popup, hacer clic en "Editar"
3. Modificar la descripción a: "Examen de glucosa en ayunas - Control mensual"
4. Cambiar la hora a: "09:30"
5. Hacer clic en "Guardar"
6. Cerrar el popup
7. Volver a hacer clic en la misma cita
8. Verificar que los cambios se guardaron correctamente

### Resultado Esperado:
✅ El modo de edición se activa correctamente
✅ Los campos se vuelven editables
✅ Los cambios se guardan exitosamente
✅ Al reabrir la cita, muestra los nuevos valores

---

## Flujo 4: Eliminar Cita → Verificar Desaparición

### Objetivo
Verificar que se puede eliminar una cita y desaparece del calendario.

### Pasos:
1. Crear una nueva cita de prueba en **Diciembre 2025** (día 25, hora 10:00, descripción "Cita de prueba para eliminar")
2. Hacer clic en la cita recién creada
3. En el popup, hacer clic en "Eliminar"
4. Confirmar la eliminación en el diálogo de confirmación
5. Verificar que el popup se cierra automáticamente
6. Verificar que la cita ya no aparece en el calendario del día 25

### Resultado Esperado:
✅ Aparece un diálogo de confirmación antes de eliminar
✅ La cita se elimina exitosamente
✅ El popup se cierra automáticamente
✅ La cita desaparece del calendario
✅ El calendario se actualiza sin necesidad de recargar la página

---

## Flujo 5: Intentar Crear Cita en el Pasado → Ver Error

### Objetivo
Verificar que el sistema rechaza la creación de citas con fechas pasadas.

### Pasos:
1. En el calendario, navegar a **Octubre 2025** (mes pasado)
2. Hacer clic en cualquier día de octubre
3. Intentar ingresar:
   - Descripción: "Cita en el pasado"
   - Hora: "10:00"
4. Hacer clic en "Crear Cita"
5. Verificar que aparece un mensaje de error

### Resultado Esperado:
✅ El sistema muestra un mensaje de error claro
✅ El mensaje indica que no se pueden crear citas en el pasado
✅ La cita NO se crea
✅ El formulario permanece abierto para corrección

---

## Flujo 6: Navegación entre Pestañas Mantiene Estado

### Objetivo
Verificar que al navegar entre las pestañas "Calendario" y "Resultados", el estado se mantiene.

### Pasos:
1. En el calendario de **Noviembre 2025**, hacer clic en la cita del **10 de noviembre** (Examen de tiroides)
2. Hacer clic en "Ver Resultados"
3. Verificar que se muestran los resultados de tiroides (TSH, T3, T4)
4. Hacer clic en la pestaña "Calendario" en la parte superior
5. Verificar que el calendario sigue mostrando noviembre 2025
6. Hacer clic nuevamente en la pestaña "Resultados"
7. Verificar que los resultados siguen cargados

### Resultado Esperado:
✅ La navegación entre pestañas funciona correctamente
✅ El calendario mantiene el mes seleccionado
✅ Los resultados se mantienen cargados al volver
✅ No hay recargas innecesarias de datos

---

## Verificaciones Adicionales

### Citas sin Resultados
1. Hacer clic en la cita del **28 de noviembre** (Examen de glucosa)
2. Hacer clic en "Ver Resultados"
3. Verificar que se muestra el mensaje: "No hay resultados disponibles para esta cita"
4. Verificar que NO aparece el mensaje de error "No se encontró la información solicitada"

### Distinción Visual
1. Navegar entre meses pasados y futuros
2. Verificar que las citas pasadas tienen un estilo visual diferente (ej: color gris o diferente)
3. Verificar que las citas futuras tienen otro estilo (ej: color azul o verde)

### Botón "Ver Resultados" Solo en Citas Pasadas
1. **Cita Futura:** Navegar a **Diciembre 2025**, hacer clic en la cita del **5 de diciembre**
   - **Verificar:** Solo aparecen botones "Edit" y "Delete"
   - **Verificar:** NO aparece el botón "View Results"
   
2. **Cita Pasada:** Navegar a **Noviembre 2025**, hacer clic en la cita del **15 de noviembre**
   - **Verificar:** Aparecen botones "Edit", "Delete" y "View Results"
   - **Verificar:** El botón "View Results" es visible y funcional
   
3. **Cita del Mismo Día (Hora Pasada):** Si hoy es 29 de noviembre, hacer clic en la cita de las 08:45
   - **Verificar:** Aparece el botón "View Results" (la hora ya pasó)
   
4. **Cita del Mismo Día (Hora Futura):** Crear una cita para hoy a las 23:00
   - **Verificar:** NO aparece el botón "View Results" (la hora aún no llega)

### Navegación del Calendario
1. Usar las flechas ← → para navegar entre meses
2. Verificar que el título del mes se actualiza correctamente
3. Verificar que las citas se cargan correctamente en cada mes
4. Navegar de diciembre a enero del siguiente año y verificar que el año cambia

---

## Problemas Corregidos

### ✅ Error "No se encontró la información solicitada" con datos presentes
**Problema:** Algunas citas mostraban sus resultados correctamente pero también mostraban el mensaje de error.

**Solución:** Se corrigió la lógica del componente `ResultsComponent` para:
- Solo mostrar el error si NO hay datos disponibles (ni appointment ni results)
- Limpiar el error cuando se cargan exitosamente los datos
- Mejorar las condiciones del template para evitar mostrar error y datos simultáneamente

**Verificación:** Ahora al ver resultados de cualquier cita, solo se muestra:
- Los datos si existen
- El mensaje "No hay resultados disponibles" si la cita no tiene resultados
- El mensaje de error solo si la cita no existe en absoluto

---

## Resumen de Pruebas

| Flujo | Estado | Notas |
|-------|--------|-------|
| Crear cita futura | ✅ | Funciona correctamente |
| Ver resultados de cita pasada | ✅ | Error corregido |
| Editar cita | ✅ | Cambios se persisten |
| Eliminar cita | ✅ | Desaparece del calendario |
| Validación fecha pasada | ✅ | Muestra error apropiado |
| Navegación entre pestañas | ✅ | Estado se mantiene |

---

## Notas Finales

- Todos los flujos principales están funcionando correctamente
- El problema del mensaje de error duplicado ha sido resuelto
- El sistema maneja correctamente citas con y sin resultados
- La validación de fechas funciona según GMT-5
- La navegación y persistencia de datos funcionan como se esperaba
