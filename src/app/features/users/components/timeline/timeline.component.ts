import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../posts/models/user.model';
import { UserPostsComponent } from '../../../posts/components/user-posts/user-posts.component';
import { UserService } from '../../../posts/services/user.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-users-timeline',
  standalone: true,
  imports: [CommonModule, UserPostsComponent, MatProgressSpinnerModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  users: User[] = [];
  loading = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.fetchUsers();
  }

  private fetchUsers() {
    this.loading = true;
    this.userService.fetchUsers().subscribe({
      next: (data: User[]) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.loading = false;
      },
    });
  }
}
