import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepts outgoing HTTP requests and adds the JWT token to the Authorization header
 * if a token exists in the AuthService.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Use Angular's inject() function to get the service instance in a functional interceptor
    const authService = inject(AuthService);
    const authToken = authService.getToken();

    // If the token exists, clone the request and add the Authorization header
    if (authToken) {
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });

        // Pass the cloned request to the next handler
        return next(cloned).pipe(
            catchError(err => {
                // If a 401 Unauthorized response is received, log out the user
                if ((err.status === 401 || err.status === 403) && authService.isLoggedIn()) {
                    console.warn('Unauthorized request - logging out');
                    authService.logout(true); // Indicate session expired
                }
                return throwError(() => err);
            })
        );
    }

    // If no token exists, proceed with the original request
    return next(req);
};