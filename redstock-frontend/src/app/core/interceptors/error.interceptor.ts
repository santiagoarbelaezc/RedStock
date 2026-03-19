import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isHandlingUnauth = false;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 && !isHandlingUnauth) {
        // Token inválido o expirado - hacer logout completo
        isHandlingUnauth = true;
        console.warn('❌ Token inválido (401), limpiando sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          isHandlingUnauth = false;
        }, 100);
      } else if (err.status === 403) {
        // Acceso denegado - usuario autenticado pero sin permisos
        // NO hacer logout, solo loguear el error
        console.warn('⚠️ Acceso denegado (403) - Sin permisos para este recurso');
      } else if (err.status === 404) {
        console.warn('⚠️ Recurso no encontrado (404):', req.url);
      }
      return throwError(() => err);
    })
  );
};
