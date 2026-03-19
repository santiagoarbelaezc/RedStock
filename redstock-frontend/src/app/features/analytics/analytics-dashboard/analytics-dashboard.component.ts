import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, CurrencyPipe, DatePipe, BaseChartDirective, LoadingSpinnerComponent, StatCardComponent],
  template: `
<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="page-title text-2xl font-bold text-gray-900 tracking-tight">Analíticas</h1>
      <p class="text-sm text-gray-400 mt-0.5">Rendimiento de ventas e inventario</p>
    </div>
    <div class="text-right">
       <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Última actualización</p>
       <p class="text-xs font-semibold text-gray-900">{{ lastUpdate | date:'HH:mm' }}</p>
    </div>
  </div>

  @if (loading) {
    <app-loading-spinner />
  } @else {
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <app-stat-card title="Ingresos" [value]="(stats.currentMonthSales | currency:'USD':'symbol':'1.0-0')!" icon="📈" subtitle="Mes actual" />
      <app-stat-card title="Unidades" [value]="stats.currentMonthUnits" icon="📦" subtitle="Volumen físico" />
      <app-stat-card title="Ventas" [value]="stats.currentMonthTransactions" icon="🧾" subtitle="Transacciones" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Comparativa Ventas</h3>
        <div class="h-[250px]">
          <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" type="line"></canvas>
        </div>
      </div>
      <div class="card p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Estado Inventario</h3>
        <div class="h-[250px]">
          <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" type="doughnut"></canvas>
        </div>
      </div>
    </div>

    <div class="card bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
       <div class="px-8 py-4 border-b border-gray-50 bg-red-50/20">
          <h3 class="text-xs font-bold text-red-600 uppercase tracking-widest">Alertas Stock Bajo</h3>
       </div>
       <table class="w-full text-sm">
         <tbody class="divide-y divide-gray-50">
           @for (item of lowStock; track item.id) {
             <tr class="hover:bg-gray-50/50 transition-colors">
               <td class="px-8 py-4 font-bold text-gray-900">{{ item.product_name }}</td>
               <td class="px-8 py-4 text-gray-400 font-mono text-xs">{{ item.sku }}</td>
               <td class="px-8 py-4 text-right font-black text-red-600">{{ item.quantity }}</td>
             </tr>
           } @empty {
             <tr><td class="px-8 py-8 text-center text-gray-400 italic">Sin alertas</td></tr>
           }
         </tbody>
       </table>
    </div>
  }
</div>
`,
  styles: [`:host { display:block; }`]
})
export class AnalyticsDashboardComponent implements OnInit {
  loading = true;
  stats: any = { currentMonthSales: 0, currentMonthUnits: 0, currentMonthTransactions: 0 };
  lowStock: any[] = [];
  lastUpdate = new Date();

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [{
      data: [], 
      label: 'Ingresos', 
      backgroundColor: 'rgba(0,0,0,0.05)', 
      borderColor: '#000', 
      pointBackgroundColor: '#000', 
      fill: true, 
      tension: 0.4
    }],
    labels: []
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
  };

  public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [{
      data: [], 
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
    }],
    labels: ['En Stock', 'Stock Bajo', 'Agotado']
  };

  public pieChartOptions: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '70%'
  };

  constructor(private analytics: AnalyticsService, private auth: AuthService) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    const branchId = user?.branch_id || user?.branchId || 1;
    this.loadData(branchId);
  }

  loadData(branchId: number) {
    this.loading = true;
    this.analytics.getSalesByMonth(branchId).subscribe({
      next: (res: any) => {
        this.stats.currentMonthSales = res?.data?.totalRevenue || 0;
        this.stats.currentMonthUnits = res?.data?.totalUnits || 0;
        this.stats.currentMonthTransactions = res?.data?.totalTransactions || 0;
      }
    });
    this.analytics.getComparison(branchId).subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.lineChartData.labels = data.map((d: any) => `${d.month}/${d.year}`).reverse();
        this.lineChartData.datasets[0].data = data.map((d: any) => d.total_revenue).reverse();
      }
    });
    this.analytics.getInventoryBehavior(branchId).subscribe({
      next: (res: any) => {
        const behavior = res?.data || { lowStock: [], outOfStock: [], totalProducts: 0 };
        this.lowStock = behavior.lowStock || [];
        const inStock = (behavior.totalProducts || 0) - (behavior.lowStock.length + behavior.outOfStock.length);
        this.pieChartData.datasets[0].data = [inStock, behavior.lowStock.length, behavior.outOfStock.length];
        this.loading = false;
        this.lastUpdate = new Date();
      },
      error: () => this.loading = false
    });
  }
}
