import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private apiUrl = `${environment.apiUrl}/transfers`;

  constructor(private http: HttpClient) {}

  getByBranch(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${branchId}`);
  }

  create(originBranchId: number, destinationBranchId: number, items: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { originBranchId, destinationBranchId, items });
  }

  confirmReception(transferId: number, items: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${transferId}/confirm`, { items });
  }
}
