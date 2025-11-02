import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedBlogService, BlogPost } from '../../shared/shared-blog.service';

@Component({
    selector: 'app-admin-blog-posts',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePipe, NgIf, NgFor],
    templateUrl: './admin-blog-posts.component.html',
    styleUrls: ['./admin-blog-posts.component.css'] // Reusing blog-posts.component.css structure
})
export class AdminBlogPostsComponent implements OnInit {
    // Data structures are simpler here, as Admin sees ALL posts by default
    allBlogs: BlogPost[] = [];
    isLoading: boolean = true;
    error: string | null = null;

    // Admin only needs one view: ALL Posts. No tabs required.
    constructor(private sharedBlogService: SharedBlogService) { }

    ngOnInit(): void {
        this.loadAllBlogs(); // Admin views all blogs immediately
    }

    /**
     * Fetches ALL blog posts from all users using the shared EmployeeService method.
     */
    loadAllBlogs(): void {
        this.sharedBlogService.getAllBlogPosts().subscribe({
            next: data => {
                this.allBlogs = data;
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load all blog posts for review.';
                this.isLoading = false;
                console.error('Admin Blog load error:', err);
            }
        });
    }

    /**
     * Handles the post deletion process for any post.
     */
    deletePost(blogId: string, authorName: string): void {
        if (!confirm(`ADMIN ACTION: Are you sure you want to delete this post by ${authorName}?`)) {
            return;
        }

        this.sharedBlogService.deleteBlogPost(blogId).subscribe({
            next: () => {
                console.log(`Admin deleted post ${blogId}.`);
                // Remove the post from the local array for instant UI update
                this.allBlogs = this.allBlogs.filter(b => b._id !== blogId);
            },
            error: err => {
                console.error('Admin deletion failed:', err);
                alert(`Deletion failed. Reason: ${err.error?.message || 'Server error.'}`);
            }
        });
    }
}