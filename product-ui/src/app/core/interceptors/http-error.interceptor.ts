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
    return 'Unable to reach the inventory service. Check the server connection and try again.';
  }

  // Backend returns RFC 7807 ProblemDetail: { detail, errors? }
  const body = error.error as { detail?: string; errors?: Record<string, string> } | null;

  if (error.status === 400 && body?.errors) {
    return Object.values(body.errors).join(' • ');
  }
  if (body?.detail) return body.detail;
  if (error.status === 403) return 'You do not have permission to make this change.';
  if (error.status === 404) return 'This product could not be found. Refresh the catalog and try again.';
  if (error.status === 409) return 'This product changed elsewhere. Refresh the catalog and try again.';
  if (error.status >= 500) return 'The server could not complete this request. Try again shortly.';
  return `The request could not be completed (${error.status}).`;
}
