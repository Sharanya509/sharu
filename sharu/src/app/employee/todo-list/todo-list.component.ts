// sharu/src/app/employee/todo-list/todo-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService, Todo } from '../employee.service';
import { OfflineTodoService } from '../offline-todo.service';
import { OfflineTodo } from '../idb.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-todo-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './todo-list.component.html',
    styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
    todos: Todo[] = [];
    newTask = '';
    isLoading = true;
    error: string | null = null;

    constructor(private employeeService: EmployeeService, private offline: OfflineTodoService) { }

    get isOnline(): boolean { return !!navigator.onLine; }

    isSynced(todo: any): boolean { return !!todo.synced; }

    ngOnInit(): void {
        this.loadLocalTodos().then(() => {
            if (navigator.onLine) {
                this.loadTodos();
                this.offline.syncPending();
            } else {
                this.isLoading = false;
            }
        });

        window.addEventListener('todo-synced', (evt: any) => {
            const id = evt.detail?.id;
            const server = evt.detail?.server;
            if (!id) return;
            const idx = this.todos.findIndex(t => (t as any)._id === id);
            if (idx >= 0) {
                if (server) {
                    this.todos.splice(idx, 1, server);
                } else {
                    (this.todos[idx] as any).synced = true;
                    setTimeout(() => { delete (this.todos[idx] as any).synced; this.todos = [...this.todos]; }, 3000);
                }
                this.todos = [...this.todos];
            }
        });
    }

    private async loadLocalTodos(): Promise<void> {
        try {
            const local = await this.offline.getAll();
            const mapped = local.map((l: OfflineTodo) => ({
                _id: l.id,
                task: l.task,
                completed: !!l.completed,
                createdAt: new Date(l.createdAt)
            } as any as Todo));
            this.todos = [...mapped, ...this.todos.filter(t => !mapped.find(m => m._id === t._id))];
        } catch (e) { console.error('Load local todos failed', e); }
    }

    /**
     * Fetches the user's To-Do list from the backend.
     */
    loadTodos(): void {
        this.error = null;
        this.isLoading = true;
        this.employeeService.getTodoList().subscribe({
            next: data => {
                this.todos = data;
                this.isLoading = false;
            },
            error: err => {
                this.error = 'Failed to load todos.';
                this.isLoading = false;
                console.error('To-do list load error:', err);
            }
        });
    }

    /**
     * Creates a new To-Do task.
     */
    addTodo(): void {
        if (!this.newTask.trim()) return;
        const task = this.newTask.trim();
        this.newTask = '';

        if (!navigator.onLine) {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            const draft: OfflineTodo = { id, task, completed: false, createdAt: new Date().toISOString(), synced: false };
            this.offline.saveLocal(draft).then(() => {
                this.todos.unshift({ _id: id, task: draft.task, completed: false, createdAt: new Date(draft.createdAt), synced: false } as any);
            }).catch(e => console.error('Save todo locally failed', e));
            return;
        }

        this.employeeService.createTodo(task).subscribe({
            next: todo => this.todos.unshift(todo),
            error: err => { this.error = 'Error creating task.'; console.error('To-do creation error:', err); }
        });
    }

    /**
     * Updates the completed status of a task.
     * @param todo The task object to update.
     */
    toggleCompleted(todo: Todo): void {
        // Optimistic update for better UX
        todo.completed = !todo.completed;

        this.employeeService.updateTodo(todo).subscribe({
            error: err => {
                console.error('Failed to update todo status:', err);
                todo.completed = !todo.completed; // Rollback on failure
                this.error = 'Failed to save changes.';
            }
        });
    }

    /**
     * Deletes a To-Do task.
     * @param id The ID of the task to delete.
     */
    deleteTodo(id: string): void {
        this.employeeService.deleteTodo(id).subscribe({
            next: () => {
                this.todos = this.todos.filter(t => t._id !== id); // Remove from local list
            },
            error: err => {
                this.error = 'Failed to delete task.';
                console.error('To-do deletion error:', err);
            }
        });
    }

    /**
     * Handles the blur event on a task item, updating the task name.
     * @param todo The todo item being edited.
     * @param taskSpan The HTML element containing the task name.
     */
    onTaskBlur(todo: Todo, taskSpan: HTMLElement): void {
        const updatedTask = taskSpan.innerText.trim();
        if (updatedTask && updatedTask !== todo.task) {
            todo.task = updatedTask;
            // Optionally, call a method to update the task on the server here
        }
    }
}