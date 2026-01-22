import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '@core/services/api.service';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'operator';
  createdAt?: Date;
  updatedAt?: Date;
}

interface LoginResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
  message?: string;
}

interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

/**
 * Authentication service using Signals
 * Manages user session state reactively
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  // Private writable signals
  private readonly _token = signal<string | null>(this.getStoredToken());
  private readonly _user = signal<User | null>(this.getStoredUser());

  // Public readonly signals
  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  // Computed signals for derived state
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly userName = computed(() => this._user()?.name ?? 'Guest');

  constructor() {
    // Load user profile if token exists
    if (this._token() && !this._user()) {
      this.loadUserProfile();
    }
  }

  /**
   * Login with email and password via API
   */
  async login(email: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.api.post<LoginResponse>('auth/login', { email, password })
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    const { user, token } = response.data;
    
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  /**
   * Clear authentication state
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await firstValueFrom(this.api.post('auth/logout', {}));
    } catch {
      // Ignore errors - continue with local cleanup
    }

    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  /**
   * Refresh user profile from API
   */
  async loadUserProfile(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.api.get<UserResponse>('auth/me')
      );

      if (response.success && response.data) {
        this._user.set(response.data);
        localStorage.setItem('auth_user', JSON.stringify(response.data));
      }
    } catch {
      // Token might be expired, clear auth state
      this.clearAuthState();
    }
  }

  /**
   * Retrieve token from storage on init
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Retrieve user from storage on init
   */
  private getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Clear all auth state
   */
  private clearAuthState(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
