import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, EmployeeHRData, NewUserPayload } from '../admin.service';

@Component({
    selector: 'app-employees-list',
    standalone: true,
    imports: [CommonModule, FormsModule, NgIf, NgFor, DatePipe],
    templateUrl: './employees-list.component.html',
    styleUrls: ['./employees-list.component.css']
})
export class EmployeesListComponent implements OnInit {
    // Data State
    allEmployees: EmployeeHRData[] = [];
    filteredEmployees: EmployeeHRData[] = [];
    isLoading: boolean = true;
    error: string | null = null;

    // Filter State
    filterText: string = '';
    filterStatus: 'all' | 'high_activity' | 'low_activity' = 'all';
    filterSort: 'name_asc' | 'activities_desc' = 'name_asc';

    // Modal State and Form Data
    isModalOpen: boolean = false;
    newUserData: NewUserPayload = {
        employeeId: '',
        name: '',
        email: '',
        password: '',
        role: 'Employee'
    };
    modalError: string = '';
    modalSuccess: string = '';
    isSubmittingUser: boolean = false;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadAllEmployeesData();
    }

    loadAllEmployeesData(): void {
        this.isLoading = true;
        this.adminService.getAllEmployeesData().subscribe({
            next: data => {
                this.allEmployees = data;
                this.applyFilters();
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load employee data.';
                this.isLoading = false;
                console.error('HR Data load error:', err);
            }
        });
    }

    // --- Filtering and Sorting ---
    applyFilters(): void {
        let result = [...this.allEmployees];

        // 1. Text Filter (by name or employeeId)
        if (this.filterText) {
            const filterLower = this.filterText.toLowerCase();
            result = result.filter(emp =>
                emp.name.toLowerCase().includes(filterLower) ||
                emp.employeeId.toLowerCase().includes(filterLower)
            );
        }

        // 2. Activity Status Filter (Threshold example: High > 10, Low <= 2)
        if (this.filterStatus === 'high_activity') {
            result = result.filter(emp => emp.totalActivities > 10);
        } else if (this.filterStatus === 'low_activity') {
            result = result.filter(emp => emp.totalActivities <= 2);
        }

        // 3. Sorting
        if (this.filterSort === 'activities_desc') {
            result.sort((a, b) => b.totalActivities - a.totalActivities);
        } else {
            // Default or name_asc
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        this.filteredEmployees = result;
    }

    // --- User Creation Modal Logic ---
    openCreateModal(): void {
        this.isModalOpen = true;
        this.modalError = '';
        this.modalSuccess = '';
        // Reset form for new input
        this.newUserData = { employeeId: '', name: '', email: '', password: '', role: 'Employee' };
    }

    closeCreateModal(): void {
        this.isModalOpen = false;
    }

    submitNewUser(): void {
        this.modalError = '';
        this.modalSuccess = '';

        if (!this.newUserData.employeeId || !this.newUserData.name || !this.newUserData.email || !this.newUserData.password) {
            this.modalError = 'All fields are required.';
            return;
        }

        this.isSubmittingUser = true;

        this.adminService.createUser(this.newUserData).subscribe({
            next: (createdUser) => {
                this.modalSuccess = `User ${createdUser.name} (${createdUser.employeeId}) created successfully!`;

                // Add new user to the local data and re-filter
                this.allEmployees.push({ ...createdUser, totalActivities: 0 });
                this.applyFilters();

                setTimeout(() => {
                    this.closeCreateModal();
                }, 1500);

            },
            error: (err) => {
                this.isSubmittingUser = false;
                const message = err.error?.message || 'Failed to create user.';
                this.modalError = message;
            }
        });
    }
}