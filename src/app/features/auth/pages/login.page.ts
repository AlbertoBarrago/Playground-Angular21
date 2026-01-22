import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Angular Playground 21</h1>
          <p class="login-subtitle">Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          @if (errorMessage()) {
            <div class="error-banner">
              {{ errorMessage() }}
            </div>
          }

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-input"
              placeholder="Enter your email"
              [class.input-error]="isFieldInvalid('email')"
            />
            @if (isFieldInvalid('email')) {
              <span class="field-error">
                @if (loginForm.get('email')?.errors?.['required']) {
                  Email is required
                } @else if (loginForm.get('email')?.errors?.['email']) {
                  Please enter a valid email
                }
              </span>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-input"
              placeholder="Enter your password"
              [class.input-error]="isFieldInvalid('password')"
            />
            @if (isFieldInvalid('password')) {
              <span class="field-error">Password is required</span>
            }
          </div>

          <button
            type="submit"
            class="submit-button"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="demo-credentials">
          <p class="demo-title">Demo Credentials</p>
          <div class="demo-users">
            <button
              type="button"
              class="demo-user-btn"
              (click)="fillCredentials('admin@warehouse.com', 'admin123')"
            >
              Admin
            </button>
            <button
              type="button"
              class="demo-user-btn"
              (click)="fillCredentials('manager@warehouse.com', 'manager123')"
            >
              Manager
            </button>
            <button
              type="button"
              class="demo-user-btn"
              (click)="fillCredentials('operator@warehouse.com', 'operator123')"
            >
              Operator
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 1rem;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        background: var(--bg-secondary, #1e1e2d);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        padding: 2.5rem;
      }

      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }

      .login-title {
        color: var(--text-primary, #ffffff);
        font-size: 1.75rem;
        font-weight: 700;
        margin: 0 0 0.5rem;
      }

      .login-subtitle {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.875rem;
        margin: 0;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .error-banner {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        color: #ef4444;
        font-size: 0.875rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.875rem;
        font-weight: 500;
      }

      .form-input {
        padding: 0.75rem 1rem;
        background: var(--bg-tertiary, #252536);
        border: 1px solid var(--border-color, #3a3a4a);
        border-radius: 8px;
        color: var(--text-primary, #ffffff);
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-input::placeholder {
        color: var(--text-muted, #6b6b7b);
      }

      .form-input:focus {
        outline: none;
        border-color: var(--primary, #6366f1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      .form-input.input-error {
        border-color: #ef4444;
      }

      .field-error {
        color: #ef4444;
        font-size: 0.75rem;
      }

      .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.875rem;
        background: var(--primary, #6366f1);
        border: none;
        border-radius: 8px;
        color: white;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
        margin-top: 0.5rem;
      }

      .submit-button:hover:not(:disabled) {
        background: var(--primary-hover, #4f46e5);
      }

      .submit-button:active:not(:disabled) {
        transform: scale(0.98);
      }

      .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .demo-credentials {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color, #3a3a4a);
      }

      .demo-title {
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0 0 1rem;
        text-align: center;
      }

      .demo-users {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
      }

      .demo-user-btn {
        padding: 0.5rem 1rem;
        background: var(--bg-tertiary, #252536);
        border: 1px solid var(--border-color, #3a3a4a);
        border-radius: 6px;
        color: var(--text-secondary, #a0a0a0);
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .demo-user-btn:hover {
        border-color: var(--primary, #6366f1);
        color: var(--text-primary, #ffffff);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && (control?.dirty || control?.touched));
  }

  fillCredentials(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Login failed. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
