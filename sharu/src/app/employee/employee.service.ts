import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// --- INTERFACE DEFINITIONS ---
// Define interfaces for type safety (based on User/Model fields)


export interface DashboardSummary {
    pendingTasks: number;
    monthlyHours: number;
    recentActivities: any[];
    welcomeMessage: string;
}

export interface ActivityLog {
    _id: string;
    userId: string;
    action: string;
    details: string;
    timestamp: Date;
    hours: number; // Added hours field
}

export interface TimesheetEntry {
    _id: string;
    date: Date;
    taskDescription: string;
    hours: number;
    submittedAt: Date;
}


export interface Todo {
    _id: string;
    task: string;
    completed: boolean;
    createdAt: Date;
}

// Update the TimesheetEntry interface slightly for the payload:
interface TimesheetPayload {
    date: Date | string;
    taskDescription: string;
    hours: number;
}


@Injectable({ providedIn: 'root' })
export class EmployeeService {
    private apiUrl = `${environment.apiUrl}/employee`; // Base URL for protected employee API

    constructor(private http: HttpClient) { }

    // =========================================================
    // CORE PROFILE & DASHBOARD
    // =========================================================

    /**
     * Fetches the profile details of the current logged-in user.
     */

    /**
     * Fetches summarized data for the employee dashboard.
     */
    getDashboardSummary(): Observable<DashboardSummary> {
        return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard-summary`);
    }

    // =========================================================
    // ACTIVITY LOGS & TIMESHEETS
    // =========================================================

    /**
     * Fetches all activity logs for the current user.
     */
    getActivityLogs(): Observable<ActivityLog[]> {
        return this.http.get<ActivityLog[]>(`${this.apiUrl}/activities`);
    }

    /**
     * Fetches all timesheet entries for the current user.
     */
    getTimesheets(): Observable<TimesheetEntry[]> {
        return this.http.get<TimesheetEntry[]>(`${this.apiUrl}/timesheets`);
    }

    // NOTE: A POST/PUT method to submit/update timesheet entries would be added here.

    // =========================================================
    // TO-DO LIST (CRUD)
    // =========================================================

    /**
     * Fetches the To-Do list for the current user.
     */
    getTodoList(): Observable<Todo[]> {
        return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
    }

    /**
     * Creates a new To-Do task.
     */
    createTodo(task: string): Observable<Todo> {
        return this.http.post<Todo>(`${this.apiUrl}/todos`, { task });
    }

    /**
     * Updates a To-Do task (e.g., toggles completed status or edits text).
     */
    updateTodo(todo: Todo): Observable<Todo> {
        const updatePayload = { task: todo.task, completed: todo.completed };
        return this.http.put<Todo>(`${this.apiUrl}/todos/${todo._id}`, updatePayload);
    }

    /**
     * Deletes a To-Do task.
     */
    deleteTodo(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/todos/${id}`);
    }

    /**
 * Creates a new activity log entry.
 */
    createActivityLog(action: string, details: string, hours: number, timestamp: string): Observable<ActivityLog> {
        return this.http.post<ActivityLog>(`${this.apiUrl}/activities`, { action, details, hours, timestamp });
    }

    createTimesheetEntry(payload: TimesheetPayload): Observable<TimesheetEntry> {
        return this.http.post<TimesheetEntry>(`${this.apiUrl}/timesheets`, payload);
    }
    /**
     * Deletes a specific blog post.
     */
    deleteBlogPost(blogId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/blogs/${blogId}`);
    }


}