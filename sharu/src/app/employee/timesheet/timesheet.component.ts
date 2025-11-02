import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, TimesheetEntry } from '../employee.service';
import { OfflineTimesheetService, OfflineTimesheet } from '../offline-timesheet.service';

@Component({
    selector: 'app-timesheet',
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe],
    templateUrl: './timesheet.component.html',
    styleUrls: ['./timesheet.component.css']
})
export class TimeSheetComponent implements OnInit {
    // mix of server TimesheetEntry and local OfflineTimesheet objects
    timesheets: any[] = [];
    isLoading: boolean = true;
    error: string | null = null;

    // Model for the new entry form
    newEntry: any = {
        date: new Date().toISOString().substring(0, 10), // Default to today in YYYY-MM-DD format
        taskDescription: '',
        hours: 0
    };

    isSubmitting: boolean = false;

    constructor(private employeeService: EmployeeService, private offline: OfflineTimesheetService) { }

    ngOnInit(): void {
        // Always load local timesheets so offline users see their saved entries
        this.loadLocalTimesheets().then(() => {
            if (navigator.onLine) {
                this.loadTimesheetHistory();
                this.offline.syncPending();
            } else {
                this.isLoading = false;
            }
        });

        window.addEventListener('timesheet-synced', (e: any) => this.handleSynced(e.detail));
    }

    isOnline() { return !!(window && (window.navigator && window.navigator.onLine)); }

    /**
     * Fetches the user's timesheet history.
     */
    loadTimesheetHistory(): void {
        this.error = null;
        this.isLoading = true;
        this.employeeService.getTimesheets().subscribe({
            next: data => {
                // start with server entries, then we'll prepend local unsynced ones
                this.timesheets = [...(data || [])];
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load timesheet history.';
                this.isLoading = false;
                console.error('Timesheet load error:', err);
            }
        });
    }

    /**
     * Submits a new timesheet entry to the backend or saves locally when offline.
     */
    submitTimesheetEntry(): void {
        if (!this.newEntry.taskDescription.trim() || this.newEntry.hours <= 0) {
            this.error = 'Please provide a task description and valid hours.';
            return;
        }

        this.isSubmitting = true;
        this.error = null;

        if (!navigator.onLine) {
            // save locally
            const local: OfflineTimesheet = {
                id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
                date: this.newEntry.date,
                taskDescription: this.newEntry.taskDescription,
                hours: this.newEntry.hours,
                createdAt: new Date().toISOString(),
                synced: false
            };
            this.offline.saveLocal(local).then(() => {
                this.timesheets.unshift(local);
                this.isSubmitting = false;
                this.newEntry = { date: new Date().toISOString().substring(0, 10), taskDescription: '', hours: 0 };
            }).catch(e => {
                this.error = 'Failed to save locally.';
                this.isSubmitting = false;
            });
            return;
        }

        this.employeeService.createTimesheetEntry(this.newEntry).subscribe({
            next: newEntry => {
                this.timesheets.unshift(newEntry);
                this.newEntry = { date: new Date().toISOString().substring(0, 10), taskDescription: '', hours: 0 };
                this.isSubmitting = false;
            },
            error: err => {
                // fallback: save locally if network/post fails
                const local: OfflineTimesheet = {
                    id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
                    date: this.newEntry.date,
                    taskDescription: this.newEntry.taskDescription,
                    hours: this.newEntry.hours,
                    createdAt: new Date().toISOString(),
                    synced: false
                };
                this.offline.saveLocal(local).then(() => {
                    this.timesheets.unshift(local);
                }).catch(() => {
                    this.error = err.error?.message || 'Error saving timesheet entry.';
                }).finally(() => { this.isSubmitting = false; });
            }
        });
    }

    private async loadLocalTimesheets() {
        try {
            const locals = await this.offline.getAll();
            // prepend any local unsynced entries not already present
            this.timesheets = [...(this.timesheets || [])];
            for (const l of locals) {
                if (!this.timesheets.find((t: any) => t.id === l.id)) {
                    this.timesheets.unshift(l);
                }
            }
        } catch (e) { }
    }

    private handleSynced(detail: any) {
        // Replace local pseudo entry with server response
        const idx = this.timesheets.findIndex(t => t.id === detail.id);
        if (idx !== -1) {
            // show a transient synced flag on the server item
            this.timesheets[idx] = { ...detail.server, synced: true };
            setTimeout(() => { if (this.timesheets[idx]) delete this.timesheets[idx].synced; }, 3000);
        } else {
            // if not found, just prepend server
            const srv = { ...detail.server, synced: true };
            this.timesheets.unshift(srv);
            setTimeout(() => { if (this.timesheets[0]) delete this.timesheets[0].synced; }, 3000);
        }
    }
}