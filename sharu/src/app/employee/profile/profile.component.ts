import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { EmployeeService } from '../employee.service';
import { SharedProfileService, UserProfile } from '../../shared/shared-profile.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    // DatePipe is required for formatting the createdAt date
    imports: [CommonModule, DatePipe, NgIf],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    userProfile: UserProfile | null = null;
    isLoading: boolean = true;
    error: string | null = null;

    constructor(private sharedProfileService: SharedProfileService) { }

    ngOnInit(): void {
        this.loadUserProfile();
    }

    /**
     * Fetches the user's profile data from the protected API endpoint.
     */
    loadUserProfile(): void {
        this.sharedProfileService.getProfile().subscribe({
            next: (profile) => {
                this.userProfile = profile;
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'Failed to load profile data. Please ensure you are logged in.';
                this.isLoading = false;
                console.error('Profile load error:', err);
            }
        });
    }

    /**
     * Generates a single initial for the avatar icon.
     */
    getAvatarInitial(): string {
        if (this.userProfile && this.userProfile.name) {
            return this.userProfile.name[0].toUpperCase();
        }
        return '?';
    }
}