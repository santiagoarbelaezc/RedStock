import { Component, OnInit } from '@angular/core';
import { NgFor, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TransferService } from '../../core/services/transfer.service';
import { InventoryService } from '../../core/services/inventory.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeStatusComponent } from '../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ColorPickerComponent } from '../../shared/components/color-picker/color-picker.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, DecimalPipe, DatePipe, CurrencyPipe, StatCardComponent, BadgeStatusComponent, LoadingSpinnerComponent, ColorPickerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  recentTransfers: any[] = [];
  stats = { totalProducts: 0, inStock: 0, pendingTransfers: 0, monthRevenue: 0 };

  get userName() { return this.auth.getCurrentUser()?.name || 'Usuario'; }
  get branchId() { 
    const u = this.auth.getCurrentUser();
    return u?.branch_id || u?.branchId || 1; 
  }

  constructor(
    private auth: AuthService,
    private analytics: AnalyticsService,
    private transfers: TransferService,
    private inventory: InventoryService,
  ) {}

  ngOnInit() {
    const bid = this.branchId;
    
    // Load inventory summary
    this.inventory.getByBranch(bid).subscribe({
      next: (res: any) => {
        const inv = res.data || [];
        this.stats.totalProducts = inv.length;
        this.stats.inStock = inv.filter((i: any) => i.quantity > 0).length;
      }
    });

    // Load analytics summary
    this.analytics.getSalesByMonth(bid).subscribe({
      next: (res: any) => { 
        this.stats.monthRevenue = res.data?.totalRevenue || 0; 
      }
    });

    // Load recent transfers
    this.transfers.getByBranch(bid).subscribe({
      next: (res: any) => {
        const list = res.data || [];
        this.stats.pendingTransfers = list.filter((t: any) => t.status === 'PENDING').length;
        this.recentTransfers = list.slice(0, 5);
        this.loading = false;
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}
