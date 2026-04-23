import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateRestaurantRequest, Restaurant } from './api.models';

@Injectable({ providedIn: 'root' })
export class RestaurantApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/restaurants`;

  findAll(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.baseUrl);
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
}
