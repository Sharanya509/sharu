import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { OfflineActivityService } from '../offline-activity.service';
import { OfflineActivity } from '../idb.service';
import { firstValueFrom } from 'rxjs';


interface ActivityLog {
    _id: string;
    userId: string;
    action: string;
    details: string;
    hours: number;
    timestamp: Date;
    isNew?: boolean; // ⬅️ NEW: Temporary flag for UI highlighting
}



@Component({
    selector: 'app-activity-logs',
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor],
    templateUrl: './activity-logs.component.html',
    styleUrls: ['./activity-logs.component.css']
})
export class ActivityLogsComponent implements OnInit {
    logs: ActivityLog[] = [];
    isLoading: boolean = true;
    error: string | null = null;
    maxDate: string = new Date().toISOString().split('T')[0];

    // Static list of common actions
    activityOptions: string[] = [
        'Select Action',
        'Finished Report',
        'Attended Meeting',
        'Code Review',
        'Client Call',
        'Research Task'
    ];

    // Model for the new activity form
    selectedAction: string = this.activityOptions[0];
    otherAction: string = '';
    newHours: number = 0.5;
    newDetails: string = '';

    // ⬅️ NEW: Date/Time Models
    newDate: string = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
    newTime: string = new Date().toTimeString().substring(0, 5); // HH:MM

    logFormVisible: boolean = false;
    isSubmitting: boolean = false;

    // removed duplicate constructor; one below injects both services

    constructor(private employeeService: EmployeeService, private offline: OfflineActivityService) { }

    ngOnInit(): void {
        // Load server logs first, but always load local IDB logs so offline history is available
        this.loadLocalLogs().then(() => {
            // Attempt to load server logs (will replace/merge) if online
            if (navigator.onLine) {
                this.loadActivityLogs();
                // attempt sync pending
                this.offline.syncPending();
            } else {
                this.isLoading = false;
            }
        });

        // Listen for synced events to update tag in UI and replace pseudo entries with server entries
        window.addEventListener('activity-synced', (evt: any) => {
            const id = evt.detail?.id;
            const server = evt.detail?.server;
            if (!id) return;

            // Find pseudo/local entry by local id
            const idx = this.logs.findIndex(l => l._id === id);
            if (idx >= 0) {
                if (server) {
                    // Replace pseudo item with server entry and mark as synced (transient)
                    const serverLog: any = server;
                    serverLog.isNew = false;
                    serverLog.synced = true;
                    this.logs.splice(idx, 1, serverLog as ActivityLog);
                    // Remove the transient synced flag after 3s
                    setTimeout(() => {
                        const item = this.logs.find(x => x._id === (serverLog as any)._id);
                        if (item) { delete (item as any).synced; this.logs = [...this.logs]; }
                    }, 3000);
                } else {
                    // No server data: mark as synced briefly
                    (this.logs[idx] as any).synced = true;
                    setTimeout(() => {
                        delete (this.logs[idx] as any).synced;
                        this.logs = [...this.logs];
                    }, 3000);
                }
                // trigger change detection
                this.logs = [...this.logs];
                return;
            }

            // If not found by local id, try find by server id and mark synced briefly
            const found = this.logs.find(l => l._id === id || (l as any)._id === id);
            if (found) {
                (found as any).synced = true;
                this.logs = [...this.logs];
                setTimeout(() => {
                    delete (found as any).synced;
                    this.logs = [...this.logs];
                }, 3000);
            }
        });
    }

    isSynced(log: any): boolean {
        return !!log.synced;
    }

    // Expose online status to template
    get isOnline(): boolean {
        return !!navigator.onLine;
    }

    private async loadLocalLogs(): Promise<void> {
        try {
            const local = await this.offline.getAll();
            // Map OfflineActivity to ActivityLog shape for UI
            const mapped: ActivityLog[] = local.map((l: OfflineActivity) => ({
                _id: l.id,
                userId: '',
                action: l.action,
                details: l.details,
                hours: l.hours,
                timestamp: new Date(l.timestamp),
                isNew: false,
                // attach synced flag dynamically on the object
            } as any as ActivityLog));

            // Add synced property to mapped entries
            mapped.forEach((m, idx) => ((m as any).synced = !!local[idx].synced));

            // Merge local entries with existing logs, preferring local for same id
            this.logs = [...mapped, ...this.logs.filter(s => !mapped.find(m => m._id === s._id))];
        } catch (e) {
            console.error('Failed to load local logs', e);
        }
    }

    // Determines if the 'Other' text input should be visible
    get showOtherActionInput(): boolean {
        return this.selectedAction === 'Other';
    }

    /**
     * ⬅️ NEW VALIDATION: Checks if the combined date/time is not in the future.
     */
    get isDateTimeValid(): boolean {
        if (!this.newDate || !this.newTime) return false;

        const selectedDateTime = new Date(`${this.newDate}T${this.newTime}:00`);
        const now = new Date();

        // Check if selected time is less than or equal to the current time
        return selectedDateTime <= now;
    }

    // Resets the form state
    resetForm(): void {
        this.selectedAction = this.activityOptions[0];
        this.otherAction = '';
        this.newHours = 0.5;
        this.newDetails = '';
        this.newDate = new Date().toISOString().substring(0, 10);
        this.newTime = new Date().toTimeString().substring(0, 5);
        this.logFormVisible = false;
        this.isSubmitting = false;
    }

    loadActivityLogs(): void {
        // ... (unchanged) ...
        this.error = null;
        this.isLoading = true;
        this.employeeService.getActivityLogs().subscribe({
            next: (data: ActivityLog[]) => {
                // Mark server items as synced for UI
                const serverLogs = data.map(d => { (d as any).synced = true; return d; });
                // Keep only local unsynced entries, and append server logs (server wins on IDs)
                const existingLocal = this.logs.filter(l => !!(l as any).synced === false);
                // Remove any local entries whose id matches a server-provided id (they were synced and deleted from IDB)
                const filteredLocal = existingLocal.filter(local => !serverLogs.find(s => s._id === local._id));
                this.logs = [...filteredLocal, ...serverLogs];
                this.isLoading = false;
            },
            error: (err: any) => {
                this.error = 'Failed to load activity logs.';
                this.isLoading = false;
                console.error('Logs load error:', err);
            }
        });
    }

    /**
     * Determines the final action string and submits the log.
     */
    async submitNewActivity(): Promise<void> {
        let finalAction = '';

        if (this.selectedAction === 'Other') {
            finalAction = this.otherAction.trim();
        } else if (this.selectedAction !== this.activityOptions[0]) {
            finalAction = this.selectedAction;
        }

        // ⬅️ Client-side final validation checks
        if (!finalAction) {
            this.error = 'Please select a valid action or enter a value in the "Other" field.';
            return;
        }
        if (this.newHours < 0.5 || this.newHours > 9.5) {
            this.error = 'Hours must be between 0.5 and 9.5.';
            return;
        }
        if (!this.isDateTimeValid) {
            this.error = 'Date and Time must be in the past.';
            return;
        }

        this.isSubmitting = true;
        this.error = null;

        // Combine date and time for ISO submission
        const logTimestamp = `${this.newDate}T${this.newTime}:00`;

        try {
            // If offline, save locally immediately
            if (!navigator.onLine) {
                const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
                const offlineAct: OfflineActivity = {
                    id,
                    action: finalAction,
                    details: this.newDetails.trim() || 'No details provided',
                    hours: this.newHours,
                    timestamp: logTimestamp,
                    synced: false
                };
                await this.offline.saveLocal(offlineAct);
                // show in UI
                const pseudo: any = {
                    _id: id,
                    action: offlineAct.action,
                    details: offlineAct.details,
                    hours: offlineAct.hours,
                    timestamp: new Date(offlineAct.timestamp),
                    isNew: true,
                    synced: false
                };
                this.logs.unshift(pseudo as ActivityLog);
                this.resetForm();
                return;
            }

            // Online: attempt server create, fallback to local on failure
            const created = await firstValueFrom(this.employeeService.createActivityLog(finalAction, this.newDetails.trim(), this.newHours, logTimestamp));
            (created as any).isNew = true;
            (created as any).synced = true;
            this.logs.unshift(created);
            this.resetForm();
        } catch (err) {
            // On any failure, persist locally
            console.warn('Server create failed, saving offline', err);
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const offlineAct: OfflineActivity = {
                id,
                action: finalAction,
                details: this.newDetails.trim() || 'No details provided',
                hours: this.newHours,
                timestamp: logTimestamp,
                synced: false
            };
            await this.offline.saveLocal(offlineAct);
            const pseudo: any = {
                _id: id,
                action: offlineAct.action,
                details: offlineAct.details,
                hours: offlineAct.hours,
                timestamp: new Date(offlineAct.timestamp),
                isNew: true,
                synced: false
            };
            this.logs.unshift(pseudo as ActivityLog);
            this.resetForm();
        } finally {
            this.isSubmitting = false;
        }
    }
}
