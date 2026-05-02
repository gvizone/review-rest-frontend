import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateReviewRequest, Review } from '../../domain/models';

@Injectable({ providedIn: 'root' })
export class ReviewApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reviews`;

  findAll(): Observable<Review[]> {
    return this.http.get<Review[]>(this.baseUrl);
  }

  findById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  create(body: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.baseUrl, body);
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}`);
  }
}
