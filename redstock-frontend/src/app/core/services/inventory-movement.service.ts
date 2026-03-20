import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryMovement } from '../models/inventory-movement.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryMovementService {
  private apiUrl = `${environment.apiUrl}/movements`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`)
      .pipe(map(res => res.data));
  }

  getByBranch(branchId: number, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/branch/${branchId}?page=${page}&limit=${limit}`)
      .pipe(map(res => res.data));
  }

  getById(id: number): Observable<InventoryMovement> {
    return this.http.get<{success: boolean, data: InventoryMovement}>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(movement: InventoryMovement): Observable<InventoryMovement> {
    return this.http.post<{success: boolean, data: InventoryMovement}>(this.apiUrl, movement)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
