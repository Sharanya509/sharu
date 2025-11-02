import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { SharedBlogService, BlogPost } from '../../shared/shared-blog.service'; // ⬅️ NEW IMPORT
import { OfflineBlogService } from '../offline-blog.service';
import { OfflineBlog } from '../idb.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-blog-posts',
    standalone: true,
    imports: [CommonModule, FormsModule, DatePipe, NgIf, NgFor],
    templateUrl: './blog-posts.component.html',
    styleUrls: ['./blog-posts.component.css']
})
export class BlogPostsComponent implements OnInit {
    allBlogs: BlogPost[] = [];
    myBlogs: BlogPost[] = [];
    activeTab: 'all' | 'my' = 'all'; // Default to 'All Posts'

    isLoading: boolean = true;
    error: string | null = null;

    // Model for new post form
    newPostTitle = '';
    newPostContent = '';
    isAddingNewPost = false; // Controls visibility of the creation form
    isSubmitting = false;

    constructor(private sharedBlogService: SharedBlogService, private offline: OfflineBlogService) { }

    ngOnInit(): void {
        // Always load local drafts so offline users see their drafts/history
        this.loadLocalDrafts().then(() => {
            // Only call server endpoints when online
            if (navigator.onLine) {
                this.loadAllBlogs();
                this.loadMyBlogs();
                this.offline.syncPending();
            } else {
                // mark loading complete when offline so UI doesn't show spinner
                this.isLoading = false;
            }
        });

        window.addEventListener('blog-synced', (evt: any) => {
            const id = evt.detail?.id;
            const server = evt.detail?.server;
            if (!id) return;
            // Replace any local draft with server-provided post
            const idxAll = this.allBlogs.findIndex(b => (b as any)._id === id);
            const idxMy = this.myBlogs.findIndex(b => (b as any)._id === id);
            if (server) {
                if (idxMy >= 0) this.myBlogs.splice(idxMy, 1, server);
                if (idxAll >= 0) this.allBlogs.splice(idxAll, 1, server);
                this.myBlogs = [...this.myBlogs]; this.allBlogs = [...this.allBlogs];
            }
        });
    }

    private async loadLocalDrafts(): Promise<void> {
        try {
            const local = await this.offline.getAll();
            const mapped = local.map((l: OfflineBlog) => ({
                _id: l.id,
                userId: '',
                authorName: 'You',
                title: l.title,
                content: l.content,
                createdAt: new Date(l.createdAt),
                // keep synced flag so UI shows correct status
                synced: !!l.synced
            } as any as BlogPost));
            // Prepend drafts to myBlogs so user sees them.
            // Defer insertion slightly to avoid SSR/client hydration mismatches
            // which can produce a "Data may be stale" warning in the console.
            setTimeout(() => { this.myBlogs = [...mapped, ...this.myBlogs]; }, 0);
        } catch (e) { console.error('Load local drafts failed', e); }
    }

    get isOnline(): boolean { return !!navigator.onLine; }

    isSynced(blog: any): boolean { return !!blog.synced; }

    loadAllBlogs(): void {
        this.sharedBlogService.getAllBlogPosts().subscribe({
            next: data => {
                this.allBlogs = data;
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load all blog posts.';
                this.isLoading = false;
                console.error('All Blogs load error:', err);
            }
        });
    }

    loadMyBlogs(): void {
        this.sharedBlogService.getMyBlogPosts().subscribe({
            next: data => this.myBlogs = data,
            error: err => console.error('My Posts load error:', err)
        });
    }

    switchTab(tab: 'all' | 'my'): void {
        this.activeTab = tab;
    }

    /**
     * Toggles the new post form visibility and clears the form if closing.
     */
    toggleAddPostForm(): void {
        this.isAddingNewPost = !this.isAddingNewPost;
        // Clear form when hiding
        if (!this.isAddingNewPost) {
            this.newPostTitle = '';
            this.newPostContent = '';
        }
    }

    /**
     * Submits a new blog post to the backend API.
     */
    submitNewPost(): void {
        if (!this.newPostTitle.trim() || !this.newPostContent.trim()) return;

        this.isSubmitting = true;
        this.error = null;
        if (!navigator.onLine) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const draft: OfflineBlog = { id, title: this.newPostTitle.trim(), content: this.newPostContent.trim(), createdAt: new Date().toISOString(), synced: false };
            this.offline.saveLocal(draft).then(() => {
                const pseudo: any = { _id: id, title: draft.title, content: draft.content, createdAt: new Date(draft.createdAt) };
                // Only show drafts in My Posts while offline; do not add to All Blogs
                this.myBlogs.unshift(pseudo);
                this.newPostTitle = '';
                this.newPostContent = '';
                this.isAddingNewPost = false;
                this.isSubmitting = false;
                this.switchTab('my');
            }).catch(e => { this.error = 'Failed to save draft'; this.isSubmitting = false; });
            return;
        }

        this.sharedBlogService.createBlogPost(this.newPostTitle.trim(), this.newPostContent.trim()).subscribe({
            next: newPost => {
                this.myBlogs.unshift(newPost);
                this.allBlogs.unshift(newPost);
                this.newPostTitle = '';
                this.newPostContent = '';
                this.isAddingNewPost = false;
                this.isSubmitting = false;
                this.switchTab('my');
            },
            error: err => {
                this.error = 'Failed to publish post.';
                this.isSubmitting = false;
                console.error('Blog creation error:', err);
            }
        });
    }

    /**
     * Handles the post deletion process.
     */
    deletePost(blogId: string): void {
        if (!confirm('Are you sure you want to permanently delete this blog post?')) {
            return;
        }

        this.sharedBlogService.deleteBlogPost(blogId).subscribe({
            next: () => {
                console.log(`Post ${blogId} deleted successfully.`);

                // Remove the post from local arrays for instant UI update
                this.allBlogs = this.allBlogs.filter(b => b._id !== blogId);
                this.myBlogs = this.myBlogs.filter(b => b._id !== blogId);

            },
            error: err => {
                console.error('Failed to delete post:', err);
                // Display specific authorization error from the backend
                alert(err.error?.message || 'Deletion failed. You may not be the author or an Admin.');
            }
        });
    }

    // ... rest of component logic ...
}