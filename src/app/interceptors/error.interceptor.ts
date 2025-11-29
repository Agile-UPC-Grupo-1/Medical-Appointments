import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';

/**
 * HTTP Interceptor for handling errors and implementing retry logic
 * Requirements: All (transversal error handling)
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    // Retry failed requests up to 3 times with exponential backoff
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Only retry on network errors or 5xx server errors
        if (error instanceof HttpErrorResponse) {
          if (error.status === 0 || error.status >= 500) {
            const delayMs = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.warn(`Retrying request (attempt ${retryCount + 1}/3) after ${delayMs}ms...`);
            return timer(delayMs);
          }
        }
        // Don't retry for other errors (4xx client errors)
        throw error;
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Backend returned an unsuccessful response code
        switch (error.status) {
          case 0:
            errorMessage = 'No se puede conectar con el servidor. Verifica que JSON Server esté ejecutándose.';
            console.error('Connection error: Server is not available');
            break;
          case 404:
            errorMessage = 'No se encontró la información solicitada';
            console.warn(`404 Not Found: ${req.url}`);
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Error del servidor. Por favor intenta nuevamente';
            console.error(`Server error (${error.status}):`, error.message);
            break;
          case 400:
            errorMessage = 'Solicitud inválida. Verifica los datos ingresados';
            console.error('Bad request:', error.error);
            break;
          case 401:
            errorMessage = 'No autorizado';
            console.error('Unauthorized access');
            break;
          case 403:
            errorMessage = 'Acceso prohibido';
            console.error('Forbidden access');
            break;
          default:
            errorMessage = `Error: ${error.status} - ${error.message}`;
            console.error(`HTTP error ${error.status}:`, error.message);
        }
      }

      // Return an observable with a user-facing error message
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
