import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getByBranch(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}`);
  }

  getAllBranches(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  updateQuantity(inventoryId: number, quantity: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${inventoryId}/quantity`, { quantity });
  }
}
