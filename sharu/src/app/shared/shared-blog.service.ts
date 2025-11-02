// sharu/src/app/shared/shared-blog.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Reusing BlogPost interface defined in employee.service
export interface BlogPost {
    _id: string;
    userId: string;
    authorName: string;
    title: string;
    content: string;
    createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class SharedBlogService {
    private apiUrl = `${environment.apiUrl}/employee`;

    constructor(private http: HttpClient) { }

    /**
     * Fetches all blog posts from all users (Used by Employee and Admin view).
     */
    getAllBlogPosts(): Observable<BlogPost[]> {
        return this.http.get<BlogPost[]>(`${this.apiUrl}/blogs`);
    }

    /**
     * Fetches only blog posts created by the current user.
     */
    getMyBlogPosts(): Observable<BlogPost[]> {
        return this.http.get<BlogPost[]>(`${this.apiUrl}/blogs/my-posts`);
    }

    /**
     * Creates a new blog post.
     */
    createBlogPost(title: string, content: string): Observable<BlogPost> {
        return this.http.post<BlogPost>(`${this.apiUrl}/blogs`, { title, content });
    }

    /**
     * Deletes a specific blog post.
     */
    deleteBlogPost(blogId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/blogs/${blogId}`);
    }
}