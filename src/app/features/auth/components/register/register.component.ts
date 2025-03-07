import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RegisterRequest } from '../../../../core/models/auth.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatErrorMessage } from '../../../../shared/utils/string-formatter';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputGroupModule } from 'primeng/inputgroup';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    HttpClientModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    InputGroupModule,
    DropdownModule,
  ],
  providers: [AuthService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  roles = ['USER', 'ADMIN'];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      currentCompany: ['', [Validators.required]],
      passwords: this.fb.group(
        {
          password: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(64),
            ],
          ],
          confirmPassword: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(64),
            ],
          ],
        },
        {
          validators: this.passwordMatchValidator,
        }
      ),
    });
  }

  getPasswordsFormControl() {
    return this.registerForm.get('passwords') as FormGroup;
  }

  get isPasswordsMatch() {
    return (
      this.getPasswordsFormControl().errors?.['passwordMismatch'] &&
      this.getPasswordsFormControl().get('confirmPassword')?.touched
    );
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;

      const registerRequest: RegisterRequest = {
        currentCompany: formValue.currentCompany,
        username: formValue.username,
        email: formValue.email,
        password: formValue.passwords.password,
        role: 'USER',
      };

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess('Registration successful');
            this.router.navigate(['/login']);
          } else {
            const errorMessage = formatErrorMessage(
              response.message || 'REGISTRATION_FAILED'
            );
            this.notificationService.showError(errorMessage);
          }
        },
        error: (error) => {
          console.log(error.error);
          const errorMessage = formatErrorMessage(
            error.error?.message || 'Registration failed. Please try again.'
          );
          this.notificationService.showError(errorMessage);
        },
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password?.value === confirmPassword?.value) {
      return null;
    }
    return { passwordMismatch: true };
  }

  get isUsernameInValid(): boolean {
    return this.isFieldInvalid('username');
  }

  get isEmailInValid(): boolean {
    return this.isFieldInvalid('email');
  }

  get isCurrentCompanyInValid(): boolean {
    return this.isFieldInvalid('currentCompany');
  }

  get isPasswordInValid() {
    return (
      this.getPasswordsFormControl().get('password')?.invalid &&
      this.getPasswordsFormControl().get('password')?.touched &&
      (!this.getPasswordsFormControl().get('password')?.value ||
        this.getPasswordsFormControl().get('password')?.value.trim() === '')
    );
  }

  get isConfirmPasswordInValid() {
    return (
      this.getPasswordsFormControl().get('confirmPassword')?.invalid &&
      this.getPasswordsFormControl().get('confirmPassword')?.touched &&
      (!this.getPasswordsFormControl().get('confirmPassword')?.value ||
        this.getPasswordsFormControl().get('confirmPassword')?.value.trim() ===
          '')
    );
  }

  get isPasswordLengthInValid() {
    return (
      this.getPasswordsFormControl().get('password')?.hasError('minlength') ||
      this.getPasswordsFormControl().get('password')?.hasError('maxlength')
    );
  }

  get isConfirmPasswordLengthInValid() {
    return (
      this.getPasswordsFormControl()
        .get('confirmPassword')
        ?.hasError('minlength') ||
      this.getPasswordsFormControl()
        .get('confirmPassword')
        ?.hasError('maxlength')
    );
  }

  get emailErrorMessage(): string {
    const control = this.registerForm.get('email');
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Email is required';
      }
      if (control.errors['email'] || control.errors['pattern']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  isFieldInvalid(field: string) {
    return (
      this.registerForm.get(field)!.invalid &&
      this.registerForm.get(field)!.touched
    );
  }
}
