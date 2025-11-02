// sharu/src/app/shared/shared-profile.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Reusing UserProfile interface defined in employee.service for consistency
export interface UserProfile {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class SharedProfileService {
    // API URL points to the backend location where the profile endpoint resides
    private apiUrl = `${environment.apiUrl}/employee`;

    constructor(private http: HttpClient) { }

    /**
     * Fetches the profile details of the current logged-in user.
     */
    getProfile(): Observable<UserProfile> {
        return this.http.get<UserProfile>(`${this.apiUrl}/profile`);
    }
}