import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está logueado (token en localStorage)
  if (auth.isLoggedIn()) {
    return true;
  }

  // Si no está logueado, redirigir al login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
