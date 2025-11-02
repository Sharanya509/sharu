import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// --- INTERFACE DEFINITIONS ---

export interface EmployeeHRData {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    totalActivities: number;
}

export interface NewUserPayload {
    employeeId: string;
    name: string;
    email: string;
    password?: string; // Required for creation
    role: 'Employee' | 'Admin';
}

export interface BlogInsights {
    totalPosts: number;
    uniqueAuthors: number;
    postsLast30Days: Array<{ _id: string, count: number }>;
    topBloggers: Array<{ _id: string, postCount: number }>;
}

export interface AdminActivityLog {
    _id: string;
    userId: {
        _id: string;
        name: string;
        employeeId: string;
    };
    action: string;
    hours: number;
    timestamp: Date;
    details: string;
}

export interface ActivityCategoryMetric { // ⬅️ NEW INTERFACE FOR AGGREGATION RESULT
    _id: string; // Activity name
    count: number; // Log count
    totalHours: number; // Total hours
}

export interface ActivityInsights {
    totalLogs: number;
    totalHoursLoggedEver: number;
    monthlyTrend: Array<{ _id: string, count: number, totalHours: number }>;
    topActivities: Array<{ _id: string, count: number }>;
    categoryMetrics: ActivityCategoryMetric[]; // ⬅️ NEW: Array of metrics per activity category
}

@Injectable({ providedIn: 'root' })
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`; // Base URL for protected admin API

    constructor(private http: HttpClient) { }

    // =========================================================
    // HR MANAGEMENT (Employee Data & Creation)
    // =========================================================

    /**
     * Fetches data for all employees, including their total activities logged.
     * @returns Observable of EmployeeHRData array.
     */
    getAllEmployeesData(): Observable<EmployeeHRData[]> {
        return this.http.get<EmployeeHRData[]>(`${this.apiUrl}/employees-data`);
    }

    /**
     * Admin function to create a new user (Employee or Admin).
     * @param userData Object containing employeeId, name, email, password, and role.
     * @returns Observable of the newly created EmployeeHRData object.
     */
    createUser(userData: NewUserPayload): Observable<EmployeeHRData> {
        // Ensure the password is included in the payload sent to the backend
        if (!userData.password) {
            throw new Error("Password is required to create a new user.");
        }
        return this.http.post<EmployeeHRData>(`${this.apiUrl}/users`, userData);
    }

    // =========================================================
    // BLOG INSIGHTS
    // =========================================================

    /**
     * Fetches aggregated statistics for blog engagement and trends.
     * @returns Observable of BlogInsights object.
     */
    getBlogInsights(): Observable<BlogInsights> {
        return this.http.get<BlogInsights>(`${this.apiUrl}/blog-insights`);
    }

    getAllActivityLogs(): Observable<AdminActivityLog[]> {
        return this.http.get<AdminActivityLog[]>(`${this.apiUrl}/all-activities`);
    }

    getActivityInsights(): Observable<ActivityInsights> {
        return this.http.get<ActivityInsights>(`${this.apiUrl}/activity-insights`);
    }
}