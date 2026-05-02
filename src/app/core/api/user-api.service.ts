import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUserRequest, User } from './api.models';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  findAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  findById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/id/${id}`);
  }

  findByEmail(email: string): Observable<User> {
    const encoded = encodeURIComponent(email);
    return this.http.get<User>(`${this.baseUrl}/email/${encoded}`);
  }

  create(body: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, body);
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}`);
  }
}
