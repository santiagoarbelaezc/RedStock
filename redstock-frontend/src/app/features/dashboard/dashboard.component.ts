import { Component, OnInit } from '@angular/core';
import { NgFor, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TransferService } from '../../core/services/transfer.service';
import { InventoryService } from '../../core/services/inventory.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeStatusComponent } from '../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ColorPickerComponent } from '../../shared/components/color-picker/color-picker.component';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';
import { ICONS } from '../../shared/constants/icons.constant';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, DecimalPipe, DatePipe, CurrencyPipe, StatCardComponent, BadgeStatusComponent, LoadingSpinnerComponent, ColorPickerComponent, SafeHtmlPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = true;
  recentTransfers: any[] = [];
  stats = { totalProducts: 0, inStock: 0, pendingTransfers: 0, monthRevenue: 0 };
  protected icons = ICONS;

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
    this.loadDashboardData();
  }

  loadDashboardData() {
    const bid = this.branchId;
    
    forkJoin({
      inventory: this.inventory.getByBranch(bid, 1, 1000),
      analytics: this.analytics.getCurrentMonthSales(bid),
      transfers: this.transfers.getByBranch(bid)
    }).subscribe({
      next: (results: any) => {
        // Process inventory
        const invData = results.inventory?.data;
        const inv = invData?.inventory || invData || [];
        this.stats.totalProducts = invData?.pagination?.total || inv.length;
        this.stats.inStock = inv.filter((i: any) => i.quantity > 0).length;

        // Process analytics
        this.stats.monthRevenue = results.analytics?.data?.totalRevenue || 0;

        // Process transfers
        const transfers = results.transfers?.data || [];
        this.stats.pendingTransfers = transfers.filter((t: any) => t.status === 'PENDING').length;
        this.recentTransfers = transfers.slice(0, 5);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
      }
    });
  }
}
