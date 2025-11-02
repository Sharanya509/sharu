import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service'; // Use AuthService for user info

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, NgFor],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    adminName: string = 'Admin User'; // Placeholder - ideally fetched from AuthService

    // Quick links mirror the main admin navigation items
    quickLinks = [
        { path: '/admin/employees', label: 'Manage Employees', icon: '👥' },
        { path: '/admin/blog-insights', label: 'View Blog Analytics', icon: '📈' },
        { path: '/admin/activities', label: 'Review All Activity', icon: '📜' },
        //  { path: '/admin/users', label: 'Create New User', icon: '➕' }
    ];

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        // Ideally, fetch the admin's name here if it was stored in session on login
        // Example (assuming 'user_name' was stored during login):
        const storedName = localStorage.getItem('user_name');
        if (storedName) {
            this.adminName = storedName;
        } else {
            // Fallback or fetch profile data
            this.adminName = 'Administrator';
        }
    }
}