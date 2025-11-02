import { Routes } from '@angular/router';

// --- PUBLIC COMPONENTS ---
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './auth/login/login.component';

// --- AUTH GUARDS ---
import { adminGuard } from './auth/admin.guard';
import { employeeGuard } from './auth/employee.guard';
import { authGuard } from './auth/auth.guard';

// --- EMPLOYEE COMPONENTS ---
import { DashboardComponent } from './employee/dashboard/dashboard.component';
import { ActivityLogsComponent } from './employee/activity-logs/activity-logs.component';
import { TimeSheetComponent } from './employee/timesheet/timesheet.component';
import { TodoListComponent } from './employee/todo-list/todo-list.component';
import { BlogPostsComponent } from './employee/blog-posts/blog-posts.component';
import { ProfileComponent } from './employee/profile/profile.component';

// --- ADMIN COMPONENTS ---
import { EmployeesListComponent } from './admin/employees-list/employees-list.component';
import { BlogInsightsComponent } from './admin/blog-insights/blog-insights.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminActivityLogsComponent } from './admin/admin-activity-logs/admin-activity-logs.component';
import { AdminBlogPostsComponent } from './admin/admin-blog-posts/admin-blog-posts.component';

export const routes: Routes = [
    // --- 1. PUBLIC ROUTES ---
    {
        path: '',
        component: HomeComponent,
        title: 'Sharu PWA | Home'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Sharu | Login'
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
        title: 'User Profile'
    },

    // --- 2. EMPLOYEE PROTECTED ROUTES (Requires employeeGuard) ---
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [employeeGuard],
        title: 'Employee Dashboard'
    },
    {
        path: 'logs',
        component: ActivityLogsComponent,
        canActivate: [employeeGuard],
        title: 'Activity Logs'
    },
    {
        path: 'timesheet',
        component: TimeSheetComponent,
        canActivate: [employeeGuard],
        title: 'Time Sheet'
    },
    {
        path: 'todo',
        component: TodoListComponent,
        canActivate: [employeeGuard],
        title: 'To-do List'
    },
    {
        path: 'blog',
        component: BlogPostsComponent,
        canActivate: [employeeGuard],
        title: 'Blog Posts'
    },
    // Profile is accessible by all logged-in users, but protected by a primary guard
    /*{
        path: 'profile',
        component: ProfileComponent,
        canActivate: [employeeGuard],
        title: 'User Profile'
    },
*/

    // --- 3. ADMIN PROTECTED ROUTES (Requires adminGuard) ---
    {
        path: 'admin/dashboard',
        component: AdminDashboardComponent,
        canActivate: [adminGuard],
        title: 'Admin Dashboard'
    },
    {
        path: 'admin/employees',
        component: EmployeesListComponent, // HR Employees List
        canActivate: [adminGuard],
        title: 'Employees List'
    },
    {
        path: 'admin/blog-insights',
        component: BlogInsightsComponent,
        canActivate: [adminGuard],
        title: 'Blog Insights'
    },
    {
        path: 'admin/activities',
        component: AdminActivityLogsComponent,
        canActivate: [adminGuard],
        title: 'All Activities Logged'
    },
    {
        path: 'admin/blogs',
        component: AdminBlogPostsComponent,
        canActivate: [adminGuard],
        title: 'Blog Management'
    },

    // --- 4. FALLBACK ROUTE (Redirects unrecognized paths to home) ---
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];