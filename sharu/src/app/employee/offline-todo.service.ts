import { Injectable } from '@angular/core';
import { IDBService, OfflineTodo } from './idb.service';
import { EmployeeService } from './employee.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfflineTodoService {
    private store = 'todos';
    constructor(private idb: IDBService, private emp: EmployeeService) {
        window.addEventListener('online', () => this.syncPending());
    }

    saveLocal(todo: OfflineTodo) { todo.synced = !!todo.synced; return this.idb.save<OfflineTodo>(todo, this.store); }
    getAll() { return this.idb.getAll<OfflineTodo>(this.store); }
    getPending() { return this.idb.getPending<OfflineTodo>(this.store); }
    delete(id: string) { return this.idb.delete(id, this.store); }

    async syncPending(): Promise<void> {
        if (!navigator.onLine) return;
        try {
            const pending = await this.getPending();
            for (const p of pending) {
                try {
                    const created = await firstValueFrom(this.emp.createTodo(p.task));
                    await this.delete(p.id);
                    window.dispatchEvent(new CustomEvent('todo-synced', { detail: { id: p.id, server: created } }));
                } catch (e) { /* keep pending */ }
            }
            try { await this.idb.deleteSynced(this.store); } catch (e) { }
        } catch (e) { }
    }
}
