import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getCurrentMonthSales(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/sales/current-month`);
  }

  getSalesComparison(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/sales/comparison`);
  }

  getDailySales(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/sales/daily`);
  }

  getInventoryBehavior(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/inventory/behavior`);
  }

  getLowStock(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/inventory/low-stock`);
  }

  getTopSellingProducts(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/products/top-selling`);
  }

  getTransfersSummary(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/transfers/summary`);
  }

  getGlobalRanking(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/global/ranking`);
  }
}
