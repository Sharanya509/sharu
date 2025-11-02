import { Injectable } from '@angular/core';
import { IDBService, OfflineActivity } from './idb.service';
import { EmployeeService } from './employee.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfflineActivityService {
    constructor(private idb: IDBService, private emp: EmployeeService) {
        // Listen for online event to trigger sync
        window.addEventListener('online', () => {
            this.syncPending();
        });
    }

    async saveLocal(activity: OfflineActivity): Promise<OfflineActivity> {
        // ensure fields
        activity.synced = !!activity.synced;
        activity.syncedAt = activity.synced ? (activity.syncedAt || new Date().toISOString()) : null;
        return this.idb.save(activity);
    }

    async getAll(): Promise<OfflineActivity[]> {
        return this.idb.getAll();
    }

    async getPending(): Promise<OfflineActivity[]> {
        return this.idb.getPending();
    }

    async markSynced(id: string): Promise<boolean> {
        return this.idb.markSynced(id);
    }

    async syncPending(): Promise<void> {
        if (!navigator.onLine) return;
        try {
            const pending = await this.getPending();
            for (const p of pending) {
                try {
                    // Use employee service to post; convert Observable to Promise and capture created server entry
                    const created = await firstValueFrom(this.emp.createActivityLog(p.action, p.details, p.hours, p.timestamp));
                    // Delete the local copy now that server has it (so offline list doesn't re-show old unsynced records)
                    try { await this.idb.delete(p.id); } catch (e) { /* ignore delete errors */ }
                    // notify clients via event and include created server item so UI can replace pseudo
                    window.dispatchEvent(new CustomEvent('activity-synced', { detail: { id: p.id, server: created } }));
                } catch (e) {
                    // keep pending
                }
            }
            // After processing pending items try a full cleanup of any synced entries
            try { await this.idb.deleteSynced(); } catch (e) { /* ignore */ }
        } catch (e) {
            // ignore
        }
    }
}
