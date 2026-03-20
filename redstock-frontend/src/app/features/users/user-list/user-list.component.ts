import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';
import { User } from '../../../core/models/user.model';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SafeHtmlPipe, LoadingSpinnerComponent, FormsModule],
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  branches: any[] = [];
  loading = false;
  currentUser: User | null = null;
  
  // Filtros
  selectedRole: string = 'all';
  selectedBranch: string = 'all';
  
  icons = ICONS;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private branchService: BranchService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadData();
    if (this.authService.isSuperAdmin()) {
      this.branchService.getAll().subscribe(res => this.branches = res.data || res);
    }
  }

  loadData(): void {
    this.loading = true;
    
    if (this.authService.isSuperAdmin()) {
      this.userService.getAll().subscribe({
        next: (res) => {
          this.users = res.data || res;
          this.loading = false;
        },
        error: () => this.loading = false
      });
    } else if (this.authService.isAdmin()) {
      const branchId = this.currentUser?.branch_id;
      if (branchId) {
        this.userService.getByBranch(branchId).subscribe({
          next: (res) => {
            this.users = res.data || res;
            this.loading = false;
          },
          error: () => this.loading = false
        });
      }
    }
  }

  get filteredUsers(): User[] {
    return this.users.filter(u => {
      const roleMatch = this.selectedRole === 'all' || u.role === this.selectedRole;
      const branchMatch = this.selectedBranch === 'all' || u.branch_id === Number(this.selectedBranch);
      return roleMatch && branchMatch;
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert(err.error?.message || 'Error al eliminar usuario')
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'superadmin': return 'bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'admin': return 'bg-gray-800 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      case 'employee': return 'bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
      default: return 'bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase';
    }
  }

  canEdit(user: User): boolean {
    if (this.authService.isSuperAdmin()) return true;
    if (this.authService.isAdmin()) {
      // Admin no edita superadmin, ni otros admins, ni a sí mismo
      return user.role === 'employee' && user.branch_id === this.currentUser?.branch_id && user.id !== this.currentUser?.id;
    }
    return false;
  }

  canDelete(user: User): boolean {
    if (user.role === 'superadmin') return false;
    if (this.authService.isSuperAdmin()) return true;
    if (this.authService.isAdmin()) {
      // Admin solo borra empleados de su sucursal y no a sí mismo
      return user.role === 'employee' && user.branch_id === this.currentUser?.branch_id && user.id !== this.currentUser?.id;
    }
    return false;
  }
}
