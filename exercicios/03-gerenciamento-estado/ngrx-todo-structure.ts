// 3.2 - Gerenciamento de Estado com NgRx (Feature To-do)

import { createAction, props, createReducer, on, Action, createSelector } from '@ngrx/store';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Interfaces para tipagem forte
export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

// Estado inicial
export const initialState: TodoState = {
  todos: [],
  loading: false,
  error: null
};

// ===== ACTIONS =====

// Load Todos
export const loadTodos = createAction('[Todo] Load Todos');
export const loadTodosSuccess = createAction(
  '[Todo] Load Todos Success',
  props<{ todos: Todo[] }>()
);
export const loadTodosError = createAction(
  '[Todo] Load Todos Error',
  props<{ error: string }>()
);

// Toggle Todo Complete
export const toggleTodoComplete = createAction(
  '[Todo] Toggle Todo Complete',
  props<{ id: number }>()
);
export const toggleTodoCompleteSuccess = createAction(
  '[Todo] Toggle Todo Complete Success',
  props<{ todo: Todo }>()
);
export const toggleTodoCompleteError = createAction(
  '[Todo] Toggle Todo Complete Error',
  props<{ error: string }>()
);

// Add Todo (bônus)
export const addTodo = createAction(
  '[Todo] Add Todo',
  props<{ todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> }>()
);
export const addTodoSuccess = createAction(
  '[Todo] Add Todo Success',
  props<{ todo: Todo }>()
);
export const addTodoError = createAction(
  '[Todo] Add Todo Error',
  props<{ error: string }>()
);

// Delete Todo (bônus)
export const deleteTodo = createAction(
  '[Todo] Delete Todo',
  props<{ id: number }>()
);
export const deleteTodoSuccess = createAction(
  '[Todo] Delete Todo Success',
  props<{ id: number }>()
);
export const deleteTodoError = createAction(
  '[Todo] Delete Todo Error',
  props<{ error: string }>()
);

// ===== REDUCER =====

export const todoReducer = createReducer(
  initialState,
  
  // Load Todos
  on(loadTodos, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(loadTodosSuccess, (state, { todos }) => ({
    ...state,
    todos,
    loading: false,
    error: null
  })),
  
  on(loadTodosError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Toggle Complete
  on(toggleTodoComplete, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(toggleTodoCompleteSuccess, (state, { todo }) => ({
    ...state,
    todos: state.todos.map(t => t.id === todo.id ? todo : t),
    loading: false,
    error: null
  })),
  
  on(toggleTodoCompleteError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Add Todo
  on(addTodo, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(addTodoSuccess, (state, { todo }) => ({
    ...state,
    todos: [...state.todos, todo],
    loading: false,
    error: null
  })),
  
  on(addTodoError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Delete Todo
  on(deleteTodo, state => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(deleteTodoSuccess, (state, { id }) => ({
    ...state,
    todos: state.todos.filter(t => t.id !== id),
    loading: false,
    error: null
  })),
  
  on(deleteTodoError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// Reducer function para compatibilidade com Angular
export function reducer(state: TodoState | undefined, action: Action) {
  return todoReducer(state, action);
}

// ===== SELECTORS =====

// Feature selector
export const selectTodoState = (state: { todo: TodoState }) => state.todo;

// Selectors básicos
export const selectTodos = createSelector(
  selectTodoState,
  (state: TodoState) => state.todos
);

export const selectLoading = createSelector(
  selectTodoState,
  (state: TodoState) => state.loading
);

export const selectError = createSelector(
  selectTodoState,
  (state: TodoState) => state.error
);

// Selectors computados
export const selectAllTodos = createSelector(
  selectTodos,
  todos => todos
);

export const selectPendingTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => !todo.completed)
);

export const selectCompletedTodos = createSelector(
  selectTodos,
  todos => todos.filter(todo => todo.completed)
);

export const selectTodosCount = createSelector(
  selectTodos,
  todos => todos.length
);

export const selectPendingTodosCount = createSelector(
  selectPendingTodos,
  pendingTodos => pendingTodos.length
);

export const selectCompletedTodosCount = createSelector(
  selectCompletedTodos,
  completedTodos => completedTodos.length
);

export const selectTodosStats = createSelector(
  selectTodosCount,
  selectPendingTodosCount,
  selectCompletedTodosCount,
  (total, pending, completed) => ({
    total,
    pending,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  })
);

// Selectors por ID
export const selectTodoById = createSelector(
  selectTodos,
  (todos: Todo[], { id }: { id: number }) => 
    todos.find(todo => todo.id === id)
);

// ===== EFFECTS =====

@Injectable()
export class TodoEffects {
  
  // Load Todos Effect
  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTodos),
      switchMap(() => {
        return this.http.get<Todo[]>('/api/todos').pipe(
          map(todos => loadTodosSuccess({ todos })),
          catchError(error => 
            of(loadTodosError({ error: error.message || 'Failed to load todos' }))
          )
        );
      })
    )
  );
  
  // Toggle Todo Complete Effect
  toggleTodoComplete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(toggleTodoComplete),
      switchMap(({ id }) => {
        return this.http.patch<Todo>(`/api/todos/${id}`, { 
          completed: true 
        }).pipe(
          map(todo => toggleTodoCompleteSuccess({ todo })),
          catchError(error => 
            of(toggleTodoCompleteError({ 
              error: error.message || 'Failed to toggle todo' 
            }))
          )
        );
      })
    )
  );
  
  // Add Todo Effect
  addTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addTodo),
      switchMap(({ todo }) => {
        const newTodo = {
          ...todo,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return this.http.post<Todo>('/api/todos', newTodo).pipe(
          map(todo => addTodoSuccess({ todo })),
          catchError(error => 
            of(addTodoError({ 
              error: error.message || 'Failed to add todo' 
            }))
          )
        );
      })
    )
  );
  
  // Delete Todo Effect
  deleteTodo$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteTodo),
      switchMap(({ id }) => {
        return this.http.delete(`/api/todos/${id}`).pipe(
          map(() => deleteTodoSuccess({ id })),
          catchError(error => 
            of(deleteTodoError({ 
              error: error.message || 'Failed to delete todo' 
            }))
          )
        );
      })
    )
  );
  
  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}
}

// ===== FACADE SERVICE (Padrão recomendado) =====

@Injectable({
  providedIn: 'root'
})
export class TodoFacade {
  // Observables do estado
  todos$ = this.store.select(selectAllTodos);
  pendingTodos$ = this.store.select(selectPendingTodos);
  completedTodos$ = this.store.select(selectCompletedTodos);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  stats$ = this.store.select(selectTodosStats);
  
  constructor(private store: Store) {}
  
  // Actions methods
  loadTodos(): void {
    this.store.dispatch(loadTodos());
  }
  
  toggleTodoComplete(id: number): void {
    this.store.dispatch(toggleTodoComplete({ id }));
  }
  
  addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.store.dispatch(addTodo({ todo }));
  }
  
  deleteTodo(id: number): void {
    this.store.dispatch(deleteTodo({ id }));
  }
  
  // Selectors methods
  getTodoById(id: number) {
    return this.store.select(selectTodoById, { id });
  }
}

// ===== MOCK SERVICE (para desenvolvimento/testes) =====

@Injectable({
  providedIn: 'root'
})
export class TodoMockService {
  private todos: Todo[] = [
    {
      id: 1,
      title: 'Aprender NgRx',
      description: 'Estudar documentação e exemplos',
      completed: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      title: 'Criar componente Todo',
      description: 'Implementar interface com NgRx',
      completed: true,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-03')
    },
    {
      id: 3,
      title: 'Escrever testes',
      description: 'Criar testes unitários e de integração',
      completed: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    }
  ];
  
  getTodos(): Observable<Todo[]> {
    return of(this.todos).pipe(delay(500));
  }
  
  toggleTodoComplete(id: number): Observable<Todo> {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      todo.updatedAt = new Date();
    }
    return of(todo!).pipe(delay(300));
  }
  
  addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Observable<Todo> {
    const newTodo: Todo = {
      ...todo,
      id: Math.max(...this.todos.map(t => t.id)) + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.todos.push(newTodo);
    return of(newTodo).pipe(delay(300));
  }
  
  deleteTodo(id: number): Observable<void> {
    this.todos = this.todos.filter(t => t.id !== id);
    return of(void 0).pipe(delay(200));
  }
}

// ===== MODULE CONFIGURATION =====

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { Store } from '@ngrx/store';

export const TODO_STATE_KEY = 'todo';

export const TodoStateModule = {
  imports: [
    StoreModule.forFeature(TODO_STATE_KEY, reducer),
    EffectsModule.forFeature([TodoEffects])
  ]
};

// Exemplo de uso em componente:

/*
@Component({
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async" class="error">{{ error$ | async }}</div>
    
    <div *ngFor="let todo of todos$ | async">
      <input 
        type="checkbox" 
        [checked]="todo.completed"
        (change)="toggleComplete(todo.id)"
      />
      <span [class.completed]="todo.completed">{{ todo.title }}</span>
      <button (click)="deleteTodo(todo.id)">Delete</button>
    </div>
    
    <div>
      Total: {{ (stats$ | async)?.total }}
      Pending: {{ (stats$ | async)?.pending }}
      Completed: {{ (stats$ | async)?.completed }}
    </div>
  `
})
export class TodoListComponent {
  todos$ = this.todoFacade.todos$;
  pendingTodos$ = this.todoFacade.pendingTodos$;
  loading$ = this.todoFacade.loading$;
  error$ = this.todoFacade.error$;
  stats$ = this.todoFacade.stats$;
  
  constructor(private todoFacade: TodoFacade) {
    this.todoFacade.loadTodos();
  }
  
  toggleComplete(id: number) {
    this.todoFacade.toggleTodoComplete(id);
  }
  
  deleteTodo(id: number) {
    this.todoFacade.deleteTodo(id);
  }
}
*/

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

export { 
  // Actions
  loadTodos, 
  loadTodosSuccess, 
  loadTodosError,
  toggleTodoComplete,
  toggleTodoCompleteSuccess,
  toggleTodoCompleteError,
  addTodo,
  addTodoSuccess,
  addTodoError,
  deleteTodo,
  deleteTodoSuccess,
  deleteTodoError,
  
  // State e Reducer
  TodoState,
  initialState,
  reducer,
  
  // Selectors
  selectTodoState,
  selectTodos,
  selectLoading,
  selectError,
  selectAllTodos,
  selectPendingTodos,
  selectCompletedTodos,
  selectTodosCount,
  selectPendingTodosCount,
  selectCompletedTodosCount,
  selectTodosStats,
  selectTodoById,
  
  // Effects
  TodoEffects,
  
  // Facade
  TodoFacade,
  
  // Mock
  TodoMockService,
  
  // Module
  TODO_STATE_KEY,
  TodoStateModule
};
