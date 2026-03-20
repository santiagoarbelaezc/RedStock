import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ProductService } from '../../../core/services/product.service';
import { BranchService } from '../../../core/services/branch.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe, FormsModule, LoadingSpinnerComponent, EmptyStateComponent, SafeHtmlPipe],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  branches: any[] = [];
  loading = true;
  protected icons = ICONS;
  
  // Filtros y Paginación
  searchTerm = '';
  selectedBranchId: number | string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  constructor(
    private productService: ProductService,
    private branchService: BranchService,
    public router: Router
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadProducts();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (res: any) => this.branches = res.data || []
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.getPaginated({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      branchId: this.selectedBranchId
    }).subscribe({
      next: (res: any) => {
        const data = res.data || {};
        this.products = data.products || [];
        this.totalItems = data.pagination?.total || 0;
        this.totalPages = data.pagination?.totalPages || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onBranchChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  handleEmptyStateAction() {
    if (this.searchTerm || this.selectedBranchId) {
      this.searchTerm = '';
      this.selectedBranchId = '';
      this.onSearch();
    } else {
      this.router.navigate(['/products/new']);
    }
  }
}
