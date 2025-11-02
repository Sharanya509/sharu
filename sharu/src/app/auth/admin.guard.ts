import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guards routes intended only for Admin users.
 */
export const adminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && authService.isAdmin()) {
        // User is logged in and has the 'Admin' role
        return true;
    }

    // If not authorized, redirect to the login page
    console.warn('Access denied. Admin privileges required.');
    return router.createUrlTree(['/login']);
};