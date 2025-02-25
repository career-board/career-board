import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { UnauthorizedComponent } from './features/auth/components/unauthorized/unauthorized.component';
import { UserListComponent } from './features/posts/components/user-list/user-list.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./core/components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/posts/components/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./features/users/components/admin/admin.component').then(
            (m) => m.AdminComponent
          ),
        canActivate: [authGuard],
        data: {
          role: 'ADMIN',
        },
      },
      {
        path: 'timeline/:userId',
        loadComponent: () =>
          import(
            './features/posts/components/timeline/post-timeline.component'
          ).then((m) => m.PostTimelineComponent),
      },
      {
        path: 'post/:id',
        loadComponent: () =>
          import('./features/posts/components/details/post-details.component').then(
            (m) => m.PostDetailsComponent
          ),
      },
      {
        path: 'user-remove',
        loadComponent: () =>
          import('./features/users/components/remove/remove.component').then(
            (m) => m.RemoveComponent
          ),
        canActivate: [authGuard],
        data: {
          role: 'MODERATOR',
        },
      },
      {
        path: 'manage-post',
        loadComponent: () =>
          import('./features/posts/components/manage/manage-create.component').then(
            (m) => m.PostCreateComponent
          ),
        canActivate: [authGuard],
      },
      // {
      //   path: 'users-timeline',
      //   loadComponent: () =>
      //     import(
      //       './dashboard/pages/components/users-timeline/users-timeline.component'
      //     ).then((m) => m.UsersTimelineComponent),
      //   canActivate: [authGuard],
      //   data: {
      //     role: 'ADMIN',
      //   },
      // },
    ],
  },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
