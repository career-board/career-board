import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatErrorMessage } from '../../../../shared/utils/string-formatter';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    CardModule,
    MessageModule,
    InputGroupModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          if (this.authService.getUserRole() == 'ADMIN') {
            this.router.navigate(['/dashboard/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }
      },
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            const successMessage = 'Login successful';
            this.notificationService.showSuccess(successMessage);
            if (this.authService.getUserRole() == 'ADMIN') {
              this.router.navigate(['/dashboard/admin']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            const errorMessage = formatErrorMessage(
              response.message || 'LOGIN_FAILED'
            );
            // this.notificationService.showError(errorMessage);
          }
        },
        error: (error) => {
          const errorMessage =
            formatErrorMessage(error.error?.message) ||
            'Login failed. Please try again.';
          this.notificationService.showError(errorMessage);
        },
      });
    }
  }

  get isUsernameValid() {
    return this.isFieldValid('username');
  }

  get isPasswordValid() {
    return this.isFieldValid('password');
  }

  isFieldValid(field: string) {
    return (
      this.loginForm.get(field)?.invalid && this.loginForm.get(field)?.touched
    );
  }
}
