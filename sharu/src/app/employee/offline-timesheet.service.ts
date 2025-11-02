import { Injectable } from '@angular/core';
import { IDBService } from './idb.service';
import { EmployeeService } from './employee.service';
import { firstValueFrom } from 'rxjs';

export interface OfflineTimesheet {
    id: string;
    date: string;
    taskDescription: string;
    hours: number;
    createdAt: string;
    synced?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OfflineTimesheetService {
    private store = 'timesheets';
    constructor(private idb: IDBService, private emp: EmployeeService) {
        window.addEventListener('online', () => this.syncPending());
    }

    saveLocal(item: OfflineTimesheet) { item.synced = !!item.synced; return this.idb.save<OfflineTimesheet>(item, this.store); }
    getAll() { return this.idb.getAll<OfflineTimesheet>(this.store); }
    getPending() { return this.idb.getPending<OfflineTimesheet>(this.store); }
    delete(id: string) { return this.idb.delete(id, this.store); }

    async syncPending(): Promise<void> {
        if (!navigator.onLine) return;
        try {
            const pending = await this.getPending();
            for (const p of pending) {
                try {
                    // Reuse createTimesheetEntry which accepts payload object
                    const created = await firstValueFrom(this.emp.createTimesheetEntry({ date: p.date, taskDescription: p.taskDescription, hours: p.hours } as any));
                    await this.delete(p.id);
                    window.dispatchEvent(new CustomEvent('timesheet-synced', { detail: { id: p.id, server: created } }));
                } catch (e) { /* keep pending */ }
            }
            try { await this.idb.deleteSynced(this.store); } catch (e) { }
        } catch (e) { }
    }
}
