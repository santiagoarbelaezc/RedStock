import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as Array<string>;
  const userRole = authService.getCurrentUserRole();

  if (!authService.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  if (!expectedRoles || expectedRoles.includes(userRole)) {
    return true;
  }

  console.warn(`[GUARD] Acceso denegado. Rol ${userRole} intentó entrar a ${state.url}`);
  
  // Redireccionar a la página de inicio correcta según el rol para evitar bucles
  if (userRole === 'superadmin') {
    return router.parseUrl('/superadmin');
  } else {
    return router.parseUrl('/dashboard');
  }
};
