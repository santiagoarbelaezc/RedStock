import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private auth: AuthService) {}

  get userName() { return this.auth.getCurrentUser()?.name || 'Usuario'; }
  get userEmail() { return this.auth.getCurrentUser()?.email || ''; }
  get branchName() { return this.auth.getCurrentUser()?.branchName || 'Sucursal Principal'; }
  get userInitials() { 
    return this.userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2); 
  }

  logout() {
    this.auth.logout();
  }
}
