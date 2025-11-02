import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { EmployeeService, DashboardSummary } from '../employee.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    // DatePipe and RouterLink are used in the template
    imports: [CommonModule, RouterLink, NgIf, NgFor, DatePipe],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    summary: DashboardSummary | null = null;
    isLoading: boolean = true;
    error: string | null = null;

    constructor(private employeeService: EmployeeService) { }

    ngOnInit(): void {
        this.loadDashboardSummary();
    }

    /**
     * Fetches the personalized dashboard summary data from the backend.
     */
    loadDashboardSummary(): void {
        this.employeeService.getDashboardSummary().subscribe({
            next: data => {
                this.summary = data;
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load dashboard data. Check API connectivity.';
                this.isLoading = false;
                console.error('Dashboard load error:', err);
            }
        });
    }
}