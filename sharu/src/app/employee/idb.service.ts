import { Injectable } from '@angular/core';

export interface OfflineActivity {
    id: string;
    action: string;
    details: string;
    hours: number;
    timestamp: string; // ISO string
    synced?: boolean;
    syncedAt?: string | null;
}

export interface OfflineTodo {
    id: string;
    task: string;
    completed?: boolean;
    createdAt: string;
    synced?: boolean;
}

export interface OfflineBlog {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    synced?: boolean;
}

const DB_NAME = 'sharu-pwa';
const DB_VERSION = 3; // bumped to create new stores (todos, blogs, timesheets) on upgrade
const DEFAULT_STORES = ['activities', 'todos', 'blogs', 'timesheets'];

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            for (const s of DEFAULT_STORES) {
                if (!db.objectStoreNames.contains(s)) {
                    const store = db.createObjectStore(s, { keyPath: 'id' });
                    try { store.createIndex('by-synced', 'synced', { unique: false }); } catch (e) { }
                }
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

@Injectable({ providedIn: 'root' })
export class IDBService {
    constructor() { }

    async save<T = any>(item: T, storeName: string = 'activities'): Promise<T> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            store.put(item as any);
            tx.oncomplete = () => resolve(item);
            tx.onerror = () => reject(tx.error);
        });
    }

    async getAll<T = any>(storeName: string = 'activities'): Promise<T[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async getPending<T = any>(storeName: string = 'activities'): Promise<T[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = store.getAll();
            req.onsuccess = () => resolve((req.result || []).filter((r: any) => !r.synced));
            req.onerror = () => reject(req.error);
        });
    }

    async markSynced(id: string, storeName: string = 'activities'): Promise<boolean> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const getReq = store.get(id);
            getReq.onsuccess = () => {
                const item = getReq.result;
                if (!item) return resolve(false);
                item.synced = true;
                item.syncedAt = new Date().toISOString();
                store.put(item);
            };
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
        });
    }

    async delete(id: string, storeName: string = 'activities'): Promise<boolean> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.delete(id);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Remove any items that are marked synced=true (cleanup leftovers from older runs)
     */
    async deleteSynced(storeName: string = 'activities'): Promise<number> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const req = store.openCursor();
            let deleted = 0;
            req.onsuccess = (e: any) => {
                const cursor: IDBCursorWithValue = e.target.result;
                if (!cursor) {
                    resolve(deleted);
                    return;
                }
                const value = cursor.value;
                if (value && value.synced) {
                    const delReq = cursor.delete();
                    delReq.onsuccess = () => { deleted++; cursor.continue(); };
                    delReq.onerror = () => { /* continue despite delete error */ cursor.continue(); };
                } else {
                    cursor.continue();
                }
            };
            req.onerror = () => reject(req.error);
        });
    }
}
