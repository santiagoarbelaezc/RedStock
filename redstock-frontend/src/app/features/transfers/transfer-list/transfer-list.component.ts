import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, DatePipe } from '@angular/common';
import { TransferService } from '../../../core/services/transfer.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [RouterLink, NgFor, DatePipe, BadgeStatusComponent, LoadingSpinnerComponent, EmptyStateComponent, SafeHtmlPipe],
  templateUrl: './transfer-list.component.html',
  styleUrl: './transfer-list.component.css'
})
export class TransferListComponent implements OnInit {
  transfers: any[] = [];
  loading = true;
  protected icons = ICONS;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  get myBranchId() { 
    const u = this.auth.getCurrentUser();
    return u?.branch_id || 1; 
  }

  constructor(private transferService: TransferService, private auth: AuthService) {}

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers(page: number = 1) {
    this.loading = true;
    this.currentPage = page;
    
    this.transferService.getByBranch(this.myBranchId, this.currentPage, this.pageSize).subscribe({
      next: (res: any) => { 
        this.transfers = res.data?.items || []; 
        this.totalItems = res.data?.pagination?.total || 0;
        this.totalPages = res.data?.pagination?.totalPages || 0;
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadTransfers(page);
    }
  }

  deleteTransfer(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta solicitud de traslado?')) return;
    
    this.transferService.delete(id).subscribe({
      next: () => this.loadTransfers(),
      error: (err) => alert(err.error?.message || 'Error al eliminar')
    });
  }

  sendTransfer(id: number) {
    if (!confirm('¿Marcar este traslado como DESPACHADO? Los productos saldrán hacia el destino.')) return;
    
    this.transferService.updateStatus(id, 'IN_TRANSIT').subscribe({
      next: () => this.loadTransfers(),
      error: (err) => alert(err.error?.message || 'Error al actualizar')
    });
  }

  isAdminOrSuperAdmin(): boolean {
    return this.auth.isAdmin() || this.auth.isSuperAdmin();
  }
}
