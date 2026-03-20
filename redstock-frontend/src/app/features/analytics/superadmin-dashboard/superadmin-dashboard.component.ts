import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, SafeHtmlPipe],
  templateUrl: './superadmin-dashboard.component.html'
})
export class SuperadminDashboardComponent implements OnInit {
  summary: any = null;
  incomeByBranch: any[] = [];
  topProducts: any[] = [];
  transfersSummary: any = null;
  loading = true;
  icons = ICONS;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    Promise.all([
      this.analyticsService.getGlobalSummary().toPromise(),
      this.analyticsService.getIncomeByBranch().toPromise(),
      this.analyticsService.getTopProductsGlobal().toPromise(),
      this.analyticsService.getTransfersGlobalSummary().toPromise()
    ]).then(([summaryRes, incomeRes, productsRes, transfersRes]) => {
      this.summary = summaryRes.data || summaryRes;
      this.incomeByBranch = incomeRes.data || incomeRes;
      this.topProducts = productsRes.data || productsRes;
      this.transfersSummary = transfersRes.data || transfersRes;
      this.loading = false;
    }).catch(err => {
      console.error('Error cargando analytics global:', err);
      this.loading = false;
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }
}
