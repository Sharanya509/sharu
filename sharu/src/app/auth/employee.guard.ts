import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guards routes intended only for Employee users.
 */
export const employeeGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn() && authService.isEmployee()) {
        // User is logged in and has the 'Employee' role
        return true;
    }

    // If not authorized, redirect to the login page
    console.warn('Access denied. Employee privileges required.');
    return router.createUrlTree(['/login']);
};