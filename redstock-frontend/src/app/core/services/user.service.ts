import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getAdmins(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admins`);
  }

  getByBranch(branchId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/branch/${branchId}`);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createAdmin(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin`, data);
  }

  createEmployee(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/employee`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
