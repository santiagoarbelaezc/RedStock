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

  get userName() { 
    return this.auth.getCurrentUser()?.name || 'Usuario'; 
  }
  
  get userEmail() { 
    return this.auth.getCurrentUser()?.email || ''; 
  }
  
  get branchName() { 
    const user = this.auth.getCurrentUser();
    if (!user) return 'Sucursal Principal';
    return user.branch_name || user.branchName || 'Sucursal Principal'; 
  }
  
  get userInitials() { 
    const name = this.auth.getCurrentUser()?.name || 'U';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2); 
  }

  logout() {
    this.auth.logout();
  }
}
