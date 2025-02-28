import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { User } from '../../../posts/models/user.model';
import { UserService } from '../../../posts/services/user.service';
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-user-remove',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './remove.component.html',
  styleUrls: ['./remove.component.scss']
})
export class RemoveComponent implements OnInit, OnDestroy {
  users: User[] = [];
  displayedColumns: string[] = ['userId', 'username', 'firstName', 'lastName', 'role', 'postCount', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers() {
    this.userService.fetchUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (error) => {
          this.notificationService.showError(error);
          if (error.includes('Session expired')) {
            this.router.navigate(['/login']);
          }
        }
      });
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: { username: user.username }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.userService.deleteUser(user.userId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (response) => {
                if (response === 'user is deleted') {
                  this.notificationService.showSuccess('User deleted successfully!');
                  this.loadUsers();
                } else {
                  this.notificationService.showError('Error deleting user');
                }
              },
              error: (error) => {
                this.notificationService.showError(error);
                if (error.includes('Session expired')) {
                  this.router.navigate(['/login']);
                }
              }
            });
        }
      });
  }
}
