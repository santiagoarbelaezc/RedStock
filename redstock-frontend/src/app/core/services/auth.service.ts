import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, User } from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkInitialAuth());

  constructor(private http: HttpClient, private router: Router) {}

  private checkInitialAuth(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => {
        this.saveSession(res);
        this.isAuthenticatedSubject.next(true);
      }));
  }

  saveSession(res: AuthResponse) {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
  }

  logout() {
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem('token'); }
  
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.warn('Error parsing user from localStorage:', error);
      return null;
    }
  }
  
  isLoggedIn() { return !!this.getToken(); }
  
  get isAuthenticated$() { return this.isAuthenticatedSubject.asObservable(); }
}
