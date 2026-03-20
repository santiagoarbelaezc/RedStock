import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
      },
      {
        path: 'inventory/:branchId',
        loadComponent: () => import('./features/inventory/inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent)
      },
      {
        path: 'transfers',
        loadComponent: () => import('./features/transfers/transfer-list/transfer-list.component').then(m => m.TransferListComponent)
      },
      {
        path: 'transfers/new',
        loadComponent: () => import('./features/transfers/transfer-form/transfer-form.component').then(m => m.TransferFormComponent)
      },
      {
        path: 'transfers/:id',
        loadComponent: () => import('./features/transfers/transfer-detail/transfer-detail.component').then(m => m.TransferDetailComponent)
      },
      {
        path: 'transfers/:id/confirm',
        loadComponent: () => import('./features/transfers/transfer-confirm/transfer-confirm.component').then(m => m.TransferConfirmComponent)
      },
      {
        path: 'branches',
        loadComponent: () => import('./features/branches/branch-list/branch-list.component').then(m => m.BranchListComponent)
      },
      {
        path: 'branches/new',
        loadComponent: () => import('./features/branches/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/analytics/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent)
      },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
