import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  fetchUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user/${userId}`);
  }

  deleteUser(userId: number): Observable<string> {
    return this.http.delete(`${this.API_URL}/users/${userId}`, { responseType: 'text' });
  }
}
