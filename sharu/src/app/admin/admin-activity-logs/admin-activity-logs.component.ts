// sharu/src/app/admin/admin-activity-logs/admin-activity-logs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, AdminActivityLog, ActivityInsights } from '../admin.service';

@Component({
    selector: 'app-admin-activity-logs',
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe],
    templateUrl: './admin-activity-logs.component.html',
    styleUrls: ['./admin-activity-logs.component.css']
})
export class AdminActivityLogsComponent implements OnInit {
    // Data
    allLogs: AdminActivityLog[] = [];
    filteredLogs: AdminActivityLog[] = [];
    insights: ActivityInsights | null = null;

    // State
    isLoadingLogs: boolean = true;
    isLoadingInsights: boolean = true;
    error: string | null = null;

    // Filters
    filterText: string = ''; // For searching by name or action
    filterHours: 'all' | 'high' | 'low' = 'all';

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadAllData();
    }

    loadAllData(): void {
        this.adminService.getAllActivityLogs().subscribe({
            next: data => {
                this.allLogs = data;
                this.applyFilters();
                this.isLoadingLogs = false;
            },
            error: err => { this.error = 'Failed to load activity data.'; this.isLoadingLogs = false; }
        });

        this.adminService.getActivityInsights().subscribe({
            next: data => { this.insights = data; this.isLoadingInsights = false; },
            error: err => { console.error('Insight error:', err); this.isLoadingInsights = false; }
        });
    }

    // --- Filtering Logic ---
    applyFilters(): void {
        let result = [...this.allLogs];

        // 1. Text Filter (by employee name or action)
        if (this.filterText) {
            const filterLower = this.filterText.toLowerCase();
            result = result.filter(log =>
                log.action.toLowerCase().includes(filterLower) ||
                log.userId.name.toLowerCase().includes(filterLower)
            );
        }

        // 2. Hours/Activity Category Filter (e.g., Low < 2 hrs, High > 6 hrs)
        if (this.filterHours === 'high') {
            result = result.filter(log => log.hours > 6);
        } else if (this.filterHours === 'low') {
            result = result.filter(log => log.hours < 2);
        }

        this.filteredLogs = result;
    }
}