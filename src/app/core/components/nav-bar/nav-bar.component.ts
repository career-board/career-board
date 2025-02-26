import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavBarComponent implements OnInit {
  userRole: string | null = '';
  isMobileMenuOpen = false;
  username: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Initial role check
    this.userRole = this.authService.getUserRole();
    this.username = this.authService.getUsername();

    // Subscribe to authentication changes
    this.authService.isAuthenticated$.subscribe(() => {
      this.userRole = this.authService.getUserRole();
      this.username = this.authService.getUsername();
    });
  }

  private updateUserRole() {
    const role = this.authService.getUserRole();
    this.userRole = role ? role.toUpperCase() : '';
  }

  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get isUser(): boolean {
    return this.userRole === 'USER';
  }

  get isModerator(): boolean {
    return this.userRole === 'MODERATOR';
  }

  onLogout() {
    this.authService.logout();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
