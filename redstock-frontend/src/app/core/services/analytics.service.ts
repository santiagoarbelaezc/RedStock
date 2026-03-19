import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getSalesByMonth(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/sales`);
  }

  getComparison(branchId: number, months = 6): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/comparison?months=${months}`);
  }

  getInventoryBehavior(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}/inventory`);
  }
}
