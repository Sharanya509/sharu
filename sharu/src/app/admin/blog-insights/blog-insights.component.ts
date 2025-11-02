import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor, DatePipe } from '@angular/common';
import { AdminService, BlogInsights } from '../admin.service';

@Component({
    selector: 'app-blog-insights',
    standalone: true,
    imports: [CommonModule, NgIf, NgFor, DatePipe],
    templateUrl: './blog-insights.component.html',
    styleUrls: ['./blog-insights.component.css']
})
export class BlogInsightsComponent implements OnInit {
    insights: BlogInsights | null = null;
    isLoading = true;
    error: string | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.loadBlogInsights();
    }

    /**
     * Fetches the aggregated blog insights from the protected Admin API endpoint.
     */
    loadBlogInsights(): void {
        this.adminService.getBlogInsights().subscribe({
            next: data => {
                this.insights = data;
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Could not load blog insights. Check API permissions.';
                this.isLoading = false;
                console.error('Blog Insights load error:', err);
            }
        });
    }
}