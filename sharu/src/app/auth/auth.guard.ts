// sharu/src/app/auth/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guards routes that only require a user to be logged in (Employee or Admin).
 */
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    console.warn('Access denied. Must be logged in.');
    return router.createUrlTree(['/login']);
};