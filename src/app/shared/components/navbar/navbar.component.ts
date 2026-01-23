import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/dashboard" class="logo">Angular Playground</a>
      </div>

      <ul class="navbar-nav">
        <li>
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Dashboard
          </a>
        </li>
        <li>
          <a
            routerLink="/inventory"
            routerLinkActive="active"
          >
            Inventory
          </a>
        </li>
      </ul>

      <div class="navbar-user">
        <span class="user-name">{{ auth.userName() }}</span>
        <span class="user-role">{{ auth.user()?.role }}</span>
        <button class="btn-logout" (click)="onLogout()">Logout</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 60px;
      background: var(--bg-secondary, #1f2937);
      border-bottom: 1px solid var(--border-color, #374151);
    }

    .navbar-brand .logo {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary, #f9fafb);
      text-decoration: none;
    }

    .navbar-nav {
      display: flex;
      gap: 8px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .navbar-nav a {
      display: block;
      padding: 8px 16px;
      border-radius: 6px;
      color: var(--text-muted, #9ca3af);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .navbar-nav a:hover {
      background: var(--bg-hover, #374151);
      color: var(--text-primary, #f9fafb);
    }

    .navbar-nav a.active {
      background: var(--primary-color, #3b82f6);
      color: white;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-primary, #f9fafb);
    }

    .user-role {
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--bg-hover, #374151);
      color: var(--text-muted, #9ca3af);
      text-transform: capitalize;
    }

    .btn-logout {
      padding: 6px 12px;
      border: 1px solid var(--border-color, #374151);
      border-radius: 6px;
      background: transparent;
      color: var(--text-muted, #9ca3af);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: var(--danger-color, #ef4444);
      border-color: var(--danger-color, #ef4444);
      color: white;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);

  async onLogout(): Promise<void> {
    await this.auth.logout();
    window.location.href = '/auth/login';
  }
}