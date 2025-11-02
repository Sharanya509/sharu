import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    // Keys used for storing data in localStorage
    private readonly TOKEN_KEY = 'auth_token';
    private readonly ROLE_KEY = 'user_role';

    constructor(private router: Router) { }

    /**
     * Saves the JWT token and user role to localStorage upon successful login.
     * @param token The JWT received from the backend.
     * @param role The user's role ('Employee' or 'Admin').
     */
    public saveSession(token: string, role: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.ROLE_KEY, role);
    }

    /**
     * Checks if a valid token exists, indicating the user is logged in.
     * @returns true if session data exists, false otherwise.
     */
    public isLoggedIn(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY) && !!localStorage.getItem(this.ROLE_KEY);
    }

    /**
     * Retrieves the stored JWT token. Used by the Interceptor.
     * @returns The JWT string or null.
     */
    public getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Retrieves the user's role.
     * @returns The role string ('Employee', 'Admin') or null.
     */
    public getRole(): string | null {
        return localStorage.getItem(this.ROLE_KEY);
    }

    /**
     * Checks if the user has the 'Employee' role.
     */
    public isEmployee(): boolean {
        return this.getRole() === 'Employee';
    }

    /**
     * Checks if the user has the 'Admin' role.
     */
    public isAdmin(): boolean {
        return this.getRole() === 'Admin';
    }

    /**
     * Clears the user session (token and role) and redirects to the home page.
     */
    public logout(sessionExpired: boolean = false): void {
        console.log('User logging out...');

        // Clear session data from local storage
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.ROLE_KEY);

        let navigationExtras: any = {};

        // ⬅️ CRITICAL: If expired, set query parameter for message display
        if (sessionExpired) {
            navigationExtras = {
                queryParams: { session: 'expired' }
            };
        }

        // Navigate to the public home page, which triggers the guards to re-check state
        this.router.navigate(['/']);
    }
}