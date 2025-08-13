import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { LoadingService } from '../services/loading.service';
import { TimeoutError } from 'rxjs';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(
    private notification: NotificationService,
    private loading: LoadingService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only show global loader for non-GET requests to avoid UI getting stuck on data fetch pages
    const showLoader = req.method !== 'GET';
    if (showLoader) {
      this.loading.show();
    }

    // Optionally add headers here (e.g., auth)
    const token = localStorage.getItem('token');
    const cloned = req.clone({
      setHeaders: {
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return next.handle(cloned).pipe(
      // Safety timeout to avoid indefinite pending requests keeping the loader visible
      timeout(15000),
      catchError((error: unknown) => {
        let message = 'Ocurrió un error inesperado.';
        if (error instanceof TimeoutError) {
          message = 'La solicitud tardó demasiado y fue cancelada. Inténtalo de nuevo.';
        }
        if (error instanceof HttpErrorResponse) {
          if (error.error?.message) {
            message = Array.isArray(error.error.message)
              ? error.error.message.join('\n')
              : String(error.error.message);
          } else if (typeof error.error === 'string') {
            message = error.error;
          } else if (error.message) {
            message = error.message;
          }
        }
        this.notification.error(message);
        return throwError(() => error);
      }),
      finalize(() => {
        if (showLoader) {
          this.loading.hide();
        }
      })
    );
  }
}
