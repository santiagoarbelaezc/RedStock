import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private apiUrl = `${environment.apiUrl}/transfers`;

  constructor(private http: HttpClient) {}

  getByBranch(branchId: number, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}?page=${page}&limit=${limit}`);
  }

  create(origin_branch_id: number, destination_branch_id: number, items: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { origin_branch_id, destination_branch_id, items });
  }

  confirmReception(transferId: number, items: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${transferId}/confirm`, { items });
  }

  updateStatus(transferId: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${transferId}/status`, { status });
  }

  getById(transferId: number | string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detail/${transferId}`);
  }

  delete(transferId: number | string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${transferId}`);
  }
}
