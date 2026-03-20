import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../../core/services/branch.service';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  branches: any[] = [];
  loading = false;
  isEdit = false;
  userId: number | null = null;
  currentUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public authService: AuthService,
    private branchService: BranchService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      branch_id: [null]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.userId = Number(id);
      this.loadUser();
      // En edición el password no es obligatorio
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    }

    if (this.authService.isSuperAdmin()) {
      this.branchService.getAll().subscribe(res => this.branches = res.data || res);
    } else if (this.authService.isAdmin()) {
      // Admin de sucursal solo puede crear empleados para su sucursal
      this.userForm.patchValue({ 
        branch_id: this.currentUser?.branch_id,
        role: 'employee' 
      });
      // Bloquear campos para el admin si es necesario
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    this.loading = true;
    this.userService.getById(this.userId).subscribe({
      next: (res) => {
        const user = res.data || res;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          role: user.role,
          branch_id: user.branch_id
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/users']);
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    this.loading = true;
    const data = this.userForm.value;
    
    const request = this.isEdit && this.userId
      ? this.userService.update(this.userId, data)
      : (data.role === 'admin' ? this.userService.createAdmin(data) : this.userService.createEmployee(data));

    request.subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (err) => {
        alert(err.error?.message || 'Error al guardar usuario');
        this.loading = false;
      }
    });
  }

  getRolesDisponibles(): string[] {
    if (this.authService.isSuperAdmin()) {
      return ['admin', 'employee'];
    }
    return ['employee'];
  }
}
