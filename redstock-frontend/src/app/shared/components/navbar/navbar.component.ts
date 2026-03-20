import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(
    private auth: AuthService,
    private branchService: BranchService
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    const bid = user?.branch_id || user?.branchId;
    
    if (user && bid && !user.branch_name) {
      this.branchService.getById(bid).subscribe({
        next: (res: any) => {
          if (res.data?.name) {
            user.branch_name = res.data.name;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      });
    }
  }

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
