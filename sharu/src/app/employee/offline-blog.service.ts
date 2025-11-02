import { Injectable } from '@angular/core';
import { IDBService, OfflineBlog } from './idb.service';
import { SharedBlogService } from '../shared/shared-blog.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OfflineBlogService {
    private store = 'blogs';
    constructor(private idb: IDBService, private blogApi: SharedBlogService) {
        window.addEventListener('online', () => this.syncPending());
    }

    saveLocal(blog: OfflineBlog) { blog.synced = !!blog.synced; return this.idb.save<OfflineBlog>(blog, this.store); }
    getAll() { return this.idb.getAll<OfflineBlog>(this.store); }
    getPending() { return this.idb.getPending<OfflineBlog>(this.store); }
    delete(id: string) { return this.idb.delete(id, this.store); }

    async syncPending(): Promise<void> {
        if (!navigator.onLine) return;
        try {
            const pending = await this.getPending();
            for (const p of pending) {
                try {
                    const created = await firstValueFrom(this.blogApi.createBlogPost(p.title, p.content));
                    await this.delete(p.id);
                    window.dispatchEvent(new CustomEvent('blog-synced', { detail: { id: p.id, server: created } }));
                } catch (e) { /* keep pending */ }
            }
            try { await this.idb.deleteSynced(this.store); } catch (e) { }
        } catch (e) { }
    }
}
