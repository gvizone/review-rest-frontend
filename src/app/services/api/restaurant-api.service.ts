import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Category,
  CreateRestaurantRequest,
  Restaurant,
  RestaurantSearchPage,
} from '../../domain/models';

@Injectable({ providedIn: 'root' })
export class RestaurantApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/restaurants`;

  findAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.baseUrl);
  }

  search(params: { q: string; page: number; limit?: number }): Observable<RestaurantSearchPage> {
    const limit = params.limit ?? 10;
    const httpParams = new HttpParams()
      .set('q', params.q)
      .set('page', String(params.page))
      .set('limit', String(limit));
    return this.http.get<RestaurantSearchPage>(`${this.baseUrl}/search`, { params: httpParams });
  }

  findCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  findById(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.baseUrl}/${id}`);
  }

  findByCategory(categoryName: string): Observable<Restaurant[]> {
    const encoded = encodeURIComponent(categoryName);
    return this.http.get<Restaurant[]>(`${this.baseUrl}/category/${encoded}`);
  }

  create(body: CreateRestaurantRequest): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.baseUrl, body);
  }

  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}`);
  }
}
