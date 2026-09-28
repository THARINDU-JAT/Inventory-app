import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../services/notification.service';

/** Shows a toast for any failed HTTP call, then rethrows so callers can react too. */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.error(toMessage(error));
      return throwError(() => error);
    })
  );
};

function toMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Please check your connection.';
  }

  // Backend returns RFC 7807 ProblemDetail: { detail, errors? }
  const body = error.error as { detail?: string; errors?: Record<string, string> } | null;

  if (error.status === 400 && body?.errors) {
    return Object.values(body.errors).join(' • ');
  }
  return body?.detail ?? `Request failed (${error.status})`;
}
