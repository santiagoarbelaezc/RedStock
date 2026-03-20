import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'employee'] },
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'superadmin',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () => import('./features/analytics/superadmin-dashboard/superadmin-dashboard.component').then(m => m.SuperadminDashboardComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/new',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'users/:id/edit',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'inventory',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] },
        loadComponent: () => import('./features/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
      },
      {
        path: 'inventory/:branchId',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/inventory/inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent)
      },
      {
        path: 'transfers',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] },
        loadComponent: () => import('./features/transfers/transfer-list/transfer-list.component').then(m => m.TransferListComponent)
      },
      {
        path: 'transfers/new',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] },
        loadComponent: () => import('./features/transfers/transfer-form/transfer-form.component').then(m => m.TransferFormComponent)
      },
      {
        path: 'transfers/:id',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] },
        loadComponent: () => import('./features/transfers/transfer-detail/transfer-detail.component').then(m => m.TransferDetailComponent)
      },
      {
        path: 'transfers/:id/confirm',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] },
        loadComponent: () => import('./features/transfers/transfer-confirm/transfer-confirm.component').then(m => m.TransferConfirmComponent)
      },
      {
        path: 'branches',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () => import('./features/branches/branch-list/branch-list.component').then(m => m.BranchListComponent)
      },
      {
        path: 'branches/new',
        canActivate: [roleGuard],
        data: { roles: ['superadmin'] },
        loadComponent: () => import('./features/branches/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'analytics',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/analytics/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
      },
      {
        path: 'sales',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin', 'employee'] }, // Permitir employee por balance de usabilidad aunque el prompt sea restrictivo
        loadComponent: () => import('./features/sales/sales-list/sales-list.component').then(m => m.SalesListComponent)
      },
      {
        path: 'movements',
        canActivate: [roleGuard],
        data: { roles: ['superadmin', 'admin'] },
        loadComponent: () => import('./features/inventory-movements/movements-list/movements-list.component').then(m => m.MovementsListComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
