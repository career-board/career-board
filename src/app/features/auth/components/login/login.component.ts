import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { take, filter } from 'rxjs/operators';

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
  isLoading = true;

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
    // Check initial auth state
    this.authService.isAuthenticated$.pipe(
      take(1),
      filter(isAuthenticated => isAuthenticated)
    ).subscribe(() => {
      this.navigateAfterLogin();
    });

    // Set loading to false after a short delay if not authenticated
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
  }

  private navigateAfterLogin(): void {
    const role = this.authService.getUserRole();
    const route = role === 'ADMIN' ? '/dashboard/admin' : '/dashboard';
    this.router.navigate([route], { replaceUrl: true });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          if (response.success) {
            const successMessage = 'Login successful';
            this.notificationService.showSuccess(successMessage);
            this.navigateAfterLogin();
          } else {
            this.isLoading = false;
            const errorMessage = formatErrorMessage(
              response.message || 'LOGIN_FAILED'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
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

  private isFieldValid(field: string): boolean {
    const formControl = this.loginForm.get(field);
    return formControl ? formControl.invalid && formControl.touched : false;
  }
}
