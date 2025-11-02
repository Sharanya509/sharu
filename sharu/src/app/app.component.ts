
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common'; // Import CommonModule features
import { AuthService } from './auth/auth.service';
import { SwUpdate } from '@angular/service-worker';
import { OfflineActivityService } from './employee/offline-activity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // List all necessary Angular modules for the component
  imports: [RouterOutlet, RouterLink, CommonModule, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sharu Employee Portal';
  isMenuOpen = false; // Controls the visibility of the Profile/Logout submenu

  // --- Employee Specific Navigation Links ---
  employeeNav = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/logs', label: 'Activity Logs' },
    { path: '/timesheet', label: 'Time sheet' },
    { path: '/todo', label: 'To-do List' },
    { path: '/blog', label: 'Blog posts' },
  ];

  // --- Admin Specific Navigation Links ---
  adminNav = [
    { path: '/admin/dashboard', label: 'Admin Dashboard' },
    { path: '/admin/employees', label: 'Employees List' },
    { path: '/admin/activities', label: 'Activities All Logged' },
    { path: '/admin/blogs', label: 'Blogs Management' },
    { path: '/admin/blog-insights', label: 'Blog Insights' },
  ];

  // --- BOTTOM NAV (Mobile UX) ---
  employeeNavMobile = [
    { path: '/logs', label: 'Activity Logs', icon: '📜' },
    { path: '/timesheet', label: 'Time Sheet', icon: '⏱️' },
    { path: '/todo', label: 'To-do List', icon: '✅' },
    { path: '/blog', label: 'Blog Posts', icon: '📝' },
  ];

  adminNavMobile = [
    { path: '/admin/employees', label: 'Employee List', icon: '👥' },
    { path: '/admin/activities', label: 'All Activities', icon: '📊' },
    { path: '/admin/blogs', label: 'Blog Manage', icon: '✍️' },
    { path: '/admin/blog-insights', label: 'Blog Insights', icon: '📈' },
  ];

  isMobile: boolean = false;


  constructor(public authService: AuthService, private swUpdate: SwUpdate, private offline: OfflineActivityService) {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          if (confirm('A new version of the app is available. Load new version?')) {
            document.location.reload();
          }
        }
      });
    }
  }

  ngOnInit(): void {
    // Optional: Add initialization logic here

    this.checkIsMobile();
    // Listen to window size changes
    window.addEventListener('resize', this.checkIsMobile.bind(this));

    // Attempt to sync any pending offline activities on app start
    if (navigator.onLine) {
      this.offline.syncPending();
    }

    // Listen for messages from service worker to trigger sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (evt: any) => {
        if (evt.data && evt.data.type === 'SYNC_ACTIVITIES') {
          this.offline.syncPending();
        }
      });
    }
  }

  /**
   * Toggles the visibility state of the user profile submenu.
   */
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  checkIsMobile(): void {
    // Set a breakpoint (e.g., 768px) that matches your CSS media query
    this.isMobile = window.innerWidth <= 768;
  }
}