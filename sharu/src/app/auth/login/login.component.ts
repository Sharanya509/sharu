import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-login',
    standalone: true,
    // CommonModule for *ngIf, *ngFor; FormsModule for ngModel
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    // Model properties for the form
    email = '';
    password = '';
    role = 'Employee'; // Default role selected

    errorMessage = '';
    isLoading = false;

    expirationMessage: string | null = null;

    // Inject necessary services
    constructor(
        private http: HttpClient,
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void { // ⬅️ CHECK QUERY PARAMS ON INIT
        // Check for 'session=expired' query parameter from the interceptor/logout action
        this.route.queryParams.subscribe(params => {
            if (params['session'] === 'expired') {
                this.expirationMessage = 'Active token expired, please login again!'; // ⬅️ Message display
            } else {
                this.expirationMessage = null;
            }
        });
    }


    onLogin() {
        this.errorMessage = '';
        this.isLoading = true;

        // Data structure expected by the backend auth controller
        const credentials = {
            email: this.email,
            password: this.password,
            role: this.role
        };

        // Make the HTTP POST request to the backend API
        this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).subscribe({
            next: (response) => {
                // 1. Save the session data using AuthService
                this.authService.saveSession(response.token, response.role);

                this.isLoading = false;

                // 2. Redirect based on the authenticated role
                if (response.role === 'Admin') {
                    this.router.navigate(['/admin/dashboard']);
                } else if (response.role === 'Employee') {
                    this.router.navigate(['/dashboard']);
                } else {
                    // Fallback if role is unexpected
                    this.router.navigate(['/profile']);
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Login Error:', err);
                // Display a user-friendly error message
                this.errorMessage = err.error?.message || 'Login failed. Please check your credentials and role.';
                this.password = ''; // Clear password field on error
            }
        });
    }
}