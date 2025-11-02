import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit { // ⬅️ IMPLEMENT OnInit
    appTitle = 'Sharu Employee & Admin Portal';

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        // ⬅️ CHECK 1: If logged in, redirect to respective dashboard
        if (this.authService.isLoggedIn()) {
            if (this.authService.isAdmin()) {
                this.router.navigate(['/admin/dashboard']);
            } else if (this.authService.isEmployee()) {
                this.router.navigate(['/dashboard']);
            }
        }
        // If not logged in, continue rendering the welcome page
    }
}