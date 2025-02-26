import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    MenuModule,
    TooltipModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  isMobileMenuOpen = false;
  username: string | null = null;
  isAdmin = false;
  isModerator = false;
  profileMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.isAdmin = this.authService.getUserRole() === 'ADMIN';
    this.isModerator = this.authService.getUserRole() === 'MODERATOR';
    
    this.initializeProfileMenu();
  }

  private initializeProfileMenu() {
    this.profileMenuItems = [
      {
        label: this.username || 'User',
        disabled: true,
        styleClass: 'username-display'
      },
      {
        label: this.isModerator ? 'Moderator' : this.isAdmin ? 'Admin' : 'User',
        disabled: true,
        styleClass: 'role-display'
      },
      { separator: true },
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/profile'
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.onLogout()
      }
    ];
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
