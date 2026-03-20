import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, CurrencyPipe, DatePipe, BaseChartDirective, LoadingSpinnerComponent, StatCardComponent, SafeHtmlPipe],
  template: `
<div class="space-y-8 pb-12">
  <!-- Header con Rol -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg" [innerHTML]="icons.analytics | safeHtml"></div>
      <div>
        <h1 class="page-title text-2xl font-bold text-gray-900 tracking-tight">Centro de Inteligencia</h1>
        <p class="text-xs text-gray-400 mt-0.5 font-medium italic">Análisis estratégico y operativo en tiempo real</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm text-right">
        <p class="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Última Sincronización</p>
        <p class="text-xs font-black text-gray-900">{{ lastUpdate | date:'HH:mm:ss' }}</p>
      </div>
      @if (isAdmin) {
        <div class="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl shadow-sm">
          <p class="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none mb-1">Acceso Global</p>
          <p class="text-xs font-black text-indigo-700">Administrador</p>
        </div>
      }
    </div>
  </div>

  @if (loading) {
    <app-loading-spinner />
  } @else {
    <!-- KPIs Principales del Mes -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <app-stat-card title="Ingresos Netos" [value]="(stats.currentMonthSales | currency:'USD':'symbol':'1.0-0')!" [icon]="icons.analytics" subtitle="Meta mensual" class="border-b-4 border-indigo-600" />
      <app-stat-card title="Ticket Promedio" [value]="(stats.avgTicket | currency:'USD':'symbol':'1.0-0')!" [icon]="icons.products" subtitle="Valor por venta" />
      <app-stat-card title="Mejor Día" [value]="(stats.bestDay?.total | currency:'USD':'symbol':'1.0-0') || '$0'" [icon]="icons.analytics" [subtitle]="(stats.bestDay?.fecha | date:'dd MMM') || 'N/A'" />
      <app-stat-card title="Promedio Diario" [value]="(stats.avgDaily | currency:'USD':'symbol':'1.0-0')!" [icon]="icons.branches" subtitle="Ingreso est." />
    </div>

    <!-- Sección Estratégica: Comparativa y Ranking -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Gráfico de Comparativa -->
      <div class="lg:col-span-2 card p-8 bg-black text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div class="flex items-center justify-between mb-8 relative">
          <div>
            <h3 class="text-xs font-black opacity-40 uppercase tracking-widest">Crecimiento Semestral</h3>
            <p class="text-[10px] text-indigo-300 font-bold mt-1">Variación histórica de ingresos</p>
          </div>
          <div class="flex items-center gap-2">
            @for (m of stats.comparison; track m.mes; let last = $last) {
              @if (last) {
                <span class="text-xs font-black" [class.text-emerald-400]="m.variacion_porcentual >= 0" [class.text-rose-400]="m.variacion_porcentual < 0">
                  {{ m.variacion_porcentual > 0 ? '+' : '' }}{{ m.variacion_porcentual | number:'1.1-1' }}%
                </span>
              }
            }
          </div>
        </div>
        <div class="h-[280px]">
          <canvas baseChart [data]="monthlyComparisonChartData" [options]="darkOptions" type="line"></canvas>
        </div>
      </div>

      <!-- Ranking Global (Visible para todos, pero con ranking detallado si es admin) -->
      <div class="card p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col">
        <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Ranking de Sucursales</h3>
        <div class="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          @for (item of stats.ranking; track item.id; let i = $index) {
            <div class="flex items-center justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
              <div class="flex items-center gap-4">
                <span class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" 
                      [class.bg-yellow-100.text-yellow-700]="i === 0"
                      [class.bg-gray-100.text-gray-700]="i === 1"
                      [class.bg-orange-100.text-orange-700]="i === 2"
                      [class.bg-white.text-gray-400]="i > 2">
                  {{ i + 1 }}
                </span>
                <div>
                  <p class="text-xs font-black text-gray-900">{{ item.name }}</p>
                  <p class="text-[9px] text-gray-400 font-bold uppercase">{{ item.total_ventas }} ventas</p>
                </div>
              </div>
              <p class="text-[11px] font-black text-gray-900">{{ item.total_ingresos | currency:'USD':'symbol':'1.0-0' }}</p>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Sección Logística: Traslados -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <div class="card p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
             {{ stats.transfers?.total_enviados }}
          </div>
          <div>
             <p class="text-[10px] text-gray-400 font-black uppercase">Enviados</p>
             <p class="text-xs font-bold text-gray-900">Total Despachos</p>
          </div>
       </div>
       <div class="card p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black">
             {{ stats.transfers?.total_recibidos }}
          </div>
          <div>
             <p class="text-[10px] text-gray-400 font-black uppercase">Recibidos</p>
             <p class="text-xs font-bold text-gray-900">Total Entradas</p>
          </div>
       </div>
       <div class="card p-6 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black">
             {{ stats.transfers?.total_con_faltantes }}
          </div>
          <div>
             <p class="text-[10px] text-gray-400 font-black uppercase">Faltantes</p>
             <p class="text-xs font-bold text-gray-900">Discrepancias</p>
          </div>
       </div>
       <div class="card p-6 bg-indigo-600 text-white rounded-[2rem] shadow-sm flex items-center gap-4">
          <div class="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-black">
             {{ stats.transfers?.total_en_transito }}
          </div>
          <div>
             <p class="text-[10px] text-indigo-200 font-black uppercase">En Tránsito</p>
             <p class="text-xs font-bold">Logística Activa</p>
          </div>
       </div>
    </div>

    <!-- Perfil de Inventario y Ventas Diarias -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <!-- Gráfico de Ventas Diarias (Mes Actual vs Anterior) -->
       <div class="lg:col-span-2 card p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest">Rendimiento Diario Comparativo</h3>
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 bg-indigo-500 rounded-full"></span><span class="text-[9px] font-black text-gray-400">MES ACTUAL</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2 h-2 bg-gray-200 rounded-full"></span><span class="text-[9px] font-black text-gray-400">ANTERIOR</span></div>
            </div>
          </div>
          <div class="h-[280px]">
            <canvas baseChart [data]="dailyTrendChartData" [options]="baseOptions" type="line"></canvas>
          </div>
       </div>

       <!-- Salud del Inventario -->
       <div class="card p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Perfil de Existencias</h3>
          <div class="flex-1 flex items-center justify-center p-4">
             <div class="h-[200px] w-full">
               <canvas baseChart [data]="inventoryDistributionData" [options]="doughnutOptions" type="doughnut"></canvas>
             </div>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-6 mt-4 border-t border-gray-50 text-center">
             <div>
               <p class="text-[9px] font-bold text-gray-400 uppercase">Saludable</p>
               <p class="text-sm font-black text-emerald-500">{{ stats.invSummary.normal }}</p>
             </div>
             <div>
               <p class="text-[9px] font-bold text-gray-400 uppercase">Crítico</p>
               <p class="text-sm font-black text-orange-500">{{ stats.invSummary.low }}</p>
             </div>
             <div>
               <p class="text-[9px] font-bold text-gray-400 uppercase">Egotado</p>
               <p class="text-sm font-black text-rose-500">{{ stats.invSummary.out }}</p>
             </div>
          </div>
       </div>
    </div>

    <!-- Alertas de Stock con Inteligencia de Red -->
    <div class="card bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
       <div class="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/20">
          <div>
            <h3 class="text-xs font-black text-rose-600 uppercase tracking-widest">Alertas de Stock Crítico</h3>
            <p class="text-[10px] text-gray-400 font-medium mt-1">Sugerencias inteligentes basadas en disponibilidad de red</p>
          </div>
          <span class="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase">{{ lowStock.length }} Alertas Activas</span>
       </div>
       <div class="overflow-x-auto">
         <table class="w-full text-sm">
           <thead>
             <tr class="text-[9px] font-black uppercase text-gray-300 tracking-widest">
               <th class="px-8 py-4 text-left">Producto</th>
               <th class="px-8 py-4 text-center">SKU</th>
               <th class="px-8 py-4 text-center">Mi Stock</th>
               <th class="px-8 py-4 text-left">Sugerencia de Abastecimiento</th>
               <th class="px-8 py-4 text-right">Acción</th>
             </tr>
           </thead>
           <tbody class="divide-y divide-gray-50">
             @for (item of lowStock; track item.id) {
               <tr class="hover:bg-gray-50/40 transition-colors">
                 <td class="px-8 py-5">
                   <p class="font-black text-gray-900">{{ item.name }}</p>
                   <p class="text-[10px] text-rose-500 font-bold uppercase" *ngIf="item.stock_actual <= 2">Acción Inmediata Requerida</p>
                 </td>
                 <td class="px-8 py-5 text-center text-gray-400 font-mono text-[10px]">{{ item.sku }}</td>
                 <td class="px-8 py-5 text-center">
                   <span class="w-8 h-8 rounded-lg flex items-center justify-center mx-auto font-black"
                         [class.bg-rose-100.text-rose-600]="item.stock_actual === 0"
                         [class.bg-orange-100.text-orange-600]="item.stock_actual > 0">
                     {{ item.stock_actual }}
                   </span>
                 </td>
                 <td class="px-8 py-5">
                    @if (item.sucursal_sugerida) {
                      <div class="flex items-center gap-3">
                         <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg" [innerHTML]="icons.branches | safeHtml"></div>
                         <div>
                            <p class="text-xs font-black text-gray-900">{{ item.sucursal_sugerida }}</p>
                            <p class="text-[10px] text-indigo-500 font-bold uppercase">Disponible: {{ item.stock_disponible }} un.</p>
                         </div>
                      </div>
                    } @else {
                      <span class="text-[10px] text-gray-400 font-medium italic">Sin stock en otras sucursales</span>
                    }
                 </td>
                 <td class="px-8 py-5 text-right">
                    <button class="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 transition-all shadow-sm">
                       Solicitar
                    </button>
                 </td>
               </tr>
             } @empty {
               <tr><td colspan="5" class="px-8 py-16 text-center text-gray-400 italic">No hay alertas críticas en el inventario actual.</td></tr>
             }
           </tbody>
         </table>
       </div>
    </div>
  }
</div>
`,
  styles: [`
    :host { display:block; }
    .card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .card:hover { transform: translateY(-2px); }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  loading = true;
  isAdmin = false;
  stats: any = { 
    currentMonthSales: 0, 
    currentMonthUnits: 0, 
    currentMonthTransactions: 0, 
    avgTicket: 0,
    avgDaily: 0,
    bestProduct: null,
    bestDay: null,
    comparison: [],
    ranking: [],
    transfers: null,
    invSummary: { normal: 0, low: 0, out: 0 }
  };
  lowStock: any[] = [];
  lastUpdate = new Date();
  protected icons = ICONS;

  // Opciones de Gráficos Básicas
  public baseOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { beginAtZero: true, grid: { color: '#f8fafc' }, ticks: { font: { size: 9, weight: 'bold' } } }, 
      x: { grid: { display: false }, ticks: { font: { size: 9, weight: 'bold' } } } 
    }
  };

  public darkOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 9 } } }, 
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 9 } } } 
    }
  };

  public doughnutOptions: any = {
    responsive: true, maintainAspectRatio: false,
    cutout: '80%',
    plugins: { 
      legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 10, weight: 'bold' } } } 
    }
  };

  // Datos de Gráficos
  public dailyTrendChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [
      { data: [], label: 'Mes Actual', borderColor: '#6366f1', borderWidth: 3, pointRadius: 0, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.05)', tension: 0.4 },
      { data: [], label: 'Mes Anterior', borderColor: '#f1f5f9', borderWidth: 2, borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.4 }
    ],
    labels: Array.from({length: 31}, (_, i) => i + 1)
  };

  public monthlyComparisonChartData: ChartConfiguration<'line'>['data'] = {
    datasets: [{
      data: [], label: 'Ingresos', 
      borderColor: '#818cf8', borderWidth: 3, pointBackgroundColor: '#fff', 
      pointBorderWidth: 2, pointRadius: 4, fill: false, tension: 0.4
    }],
    labels: []
  };

  public inventoryDistributionData: ChartConfiguration<'doughnut'>['data'] = {
    datasets: [{
      data: [], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 4
    }],
    labels: ['Saludable', 'Crítico', 'Agotado']
  };

  constructor(private analytics: AnalyticsService, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    this.isAdmin = user?.role === 'admin';
    const branchId = user?.branch_id || 1;
    this.loadAllData(branchId);
  }

  loadAllData(branchId: number) {
    this.loading = true;
    
    forkJoin({
      current: this.analytics.getCurrentMonthSales(branchId),
      comparison: this.analytics.getSalesComparison(branchId),
      daily: this.analytics.getDailySales(branchId),
      inventory: this.analytics.getInventoryBehavior(branchId),
      lowStock: this.analytics.getLowStock(branchId),
      transfers: this.analytics.getTransfersSummary(branchId),
      ranking: this.analytics.getGlobalRanking()
    }).subscribe({
      next: (res: any) => {
        // 1. KPIs Mensuales
        const c = res.current?.data;
        this.stats.currentMonthSales = c?.total_ingresos || 0;
        this.stats.currentMonthUnits = c?.total_productos_vendidos || 0;
        this.stats.currentMonthTransactions = c?.total_ventas || 0;
        this.stats.avgTicket = c?.promedio_diario || 0; // Usando promedio diario como ejemplo
        this.stats.bestProduct = c?.producto_mas_vendido;
        this.stats.bestDay = c?.mejor_dia;
        this.stats.avgDaily = c?.promedio_diario || 0;

        // 2. Gráfico de Comparación (Últimos 6 meses)
        const comp = res.comparison?.data || [];
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        this.stats.comparison = comp;
        this.monthlyComparisonChartData.labels = comp.map((d: any) => months[d.mes - 1]);
        this.monthlyComparisonChartData.datasets[0].data = comp.map((d: any) => d.total_ingresos);

        // 3. Gráfico de Ventas Diarias
        const daily = res.daily?.data;
        const currentData = new Array(31).fill(0);
        const previousData = new Array(31).fill(0);
        daily?.mes_actual?.forEach((d: any) => currentData[d.dia - 1] = d.ingresos);
        daily?.mes_anterior?.forEach((d: any) => previousData[d.dia - 1] = d.ingresos);
        this.dailyTrendChartData.datasets[0].data = currentData;
        this.dailyTrendChartData.datasets[1].data = previousData;

        // 4. Inventario & Alertas
        this.lowStock = res.lowStock?.data || [];
        const inv = res.inventory?.data || [];
        this.stats.invSummary = {
          normal: inv.filter((p: any) => p.stock_actual > 5).length,
          low: inv.filter((p: any) => p.stock_actual > 0 && p.stock_actual <= 5).length,
          out: inv.filter((p: any) => p.stock_actual === 0).length
        };
        this.inventoryDistributionData.datasets[0].data = [this.stats.invSummary.normal, this.stats.invSummary.low, this.stats.invSummary.out];

        // 5. Traslados & Ranking
        this.stats.transfers = res.transfers?.data;
        this.stats.ranking = res.ranking?.data || [];

        this.loading = false;
        this.lastUpdate = new Date();
        this.updateCharts();
      },
      error: () => this.loading = false
    });
  }

  private updateCharts(): void {
    if (this.charts) {
      this.charts.forEach(chart => chart.chart?.update());
    }
    this.cdr.detectChanges();
  }
}
