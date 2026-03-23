import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getByBranch(branchId: number, page?: number, limit?: number, search: string = ''): Observable<any> {
    let url = `${this.apiUrl}/${branchId}?page=${page || 1}&limit=${limit || 10}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<any>(url);
  }

  getAllBranches(page?: number, limit?: number, search: string = '', branchId: string | number = ''): Observable<any> {
    let url = `${this.apiUrl}?page=${page || 1}&limit=${limit || 10}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (branchId) {
      url += `&branchId=${branchId}`;
    }
    return this.http.get<any>(url);
  }

  updateQuantity(branchId: number, productId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${branchId}/${productId}`, { quantity });
  }
}
