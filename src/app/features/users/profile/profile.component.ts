import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../posts/services/user.service';
import { User } from '../../posts/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error: string | null = null;
  
  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const userId = this.authService.getUserId();

      const result = await this.userService.getUser(Number(userId)).toPromise();
      this.user = result || null;
    } catch (err) {
      this.error = 'Error loading profile';
      console.error('Profile loading error:', err);
    } finally {
      this.loading = false;
    }
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
