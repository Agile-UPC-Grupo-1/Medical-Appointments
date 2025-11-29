# Medical Appointments Calendar

Una aplicación Angular para la gestión de citas médicas con calendario interactivo y visualización de resultados de laboratorio.

## Requisitos Previos

- Node.js (v18 o superior)
- npm (v10 o superior)
- Angular CLI (v17.3.6)

## Instalación

Las dependencias ya están instaladas. Si necesitas reinstalarlas:

```bash
npm install
```

## Dependencias Principales

- **Angular 17.3**: Framework principal
- **Angular Material 17**: Componentes UI
- **date-fns & date-fns-tz**: Manejo de fechas y zonas horarias (GMT-5)
- **fast-check**: Property-based testing
- **json-server**: Backend simulado para desarrollo

## Ejecutar la Aplicación

### Opción 1: Ejecutar ambos servidores con un solo comando (Recomendado)

Este comando inicia tanto JSON Server como Angular dev server simultáneamente:

```bash
npm run start:dev
```

La aplicación estará disponible en `http://localhost:4200`
JSON Server estará disponible en `http://localhost:3000`

### Opción 2: Ejecutar servidores manualmente

Si prefieres ejecutar los servidores por separado:

**Terminal 1 - JSON Server:**
```bash
npm run start:server
```

**Terminal 2 - Angular Dev Server:**
```bash
npm start
```

### Scripts Disponibles

- `npm start` - Inicia solo el servidor de desarrollo de Angular (puerto 4200)
- `npm run start:server` - Inicia solo JSON Server (puerto 3000)
- `npm run start:dev` - Inicia ambos servidores simultáneamente (recomendado)
- `npm run json-server` - Alias para iniciar JSON Server
- `npm test` - Ejecuta los tests unitarios y property-based tests
- `npm run build` - Compila la aplicación para producción

## Estructura del Proyecto

```
medical-appointments/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── calendar/          # Componente del calendario
│   │   │   ├── appointment-popup/ # Modal de detalles de cita
│   │   │   └── results/           # Pantalla de resultados médicos
│   │   ├── services/              # Servicios (AppointmentService, TimezoneService)
│   │   ├── models/                # Interfaces TypeScript
│   │   ├── app.component.*        # Componente raíz con navegación
│   │   ├── app.config.ts          # Configuración de la app
│   │   └── app.routes.ts          # Configuración de rutas
│   ├── styles.css                 # Estilos globales
│   └── index.html
├── db.json                        # Base de datos JSON Server
└── package.json

```

## Rutas de la Aplicación

- `/` - Redirige a `/calendar`
- `/calendar` - Vista del calendario con todas las citas
- `/results` - Vista de resultados sin cita seleccionada
- `/results/:id` - Vista de resultados para una cita específica

## Ejecutar Tests

```bash
npm test
```

Los tests incluyen:
- **Unit tests**: Jasmine + Karma
- **Property-based tests**: fast-check

## Base de Datos (db.json)

El archivo `db.json` contiene:
- **appointments**: Citas médicas con fecha, hora y descripción
- **results**: Resultados médicos asociados a citas (glucosa, sangre, hígado, hemograma)

Ejemplo de cita:
```json
{
  "id": 1,
  "date": "2024-11-15",
  "time": "09:00",
  "description": "Examen de glucosa en ayunas",
  "createdAt": "2024-11-10T10:00:00-05:00"
}
```

## Zona Horaria

La aplicación utiliza **GMT-5** para todas las operaciones de fecha y hora. Esto se maneja mediante el servicio `TimezoneService` usando la librería `date-fns-tz`.

## Próximos Pasos

Este es el setup inicial del proyecto. Las siguientes tareas implementarán:
1. Modelos de datos e interfaces TypeScript
2. TimezoneService para manejo de GMT-5
3. AppointmentService para comunicación con JSON Server
4. Componentes del calendario y resultados
5. Tests unitarios y property-based tests

## Desarrollo

Para agregar nuevos componentes:
```bash
ng generate component components/nombre-componente --standalone
```

Para agregar nuevos servicios:
```bash
ng generate service services/nombre-servicio
```

## Build de Producción

```bash
npm run build
```

Los archivos compilados estarán en `dist/medical-appointments/`.
