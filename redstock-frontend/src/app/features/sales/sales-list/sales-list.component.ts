import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaleService } from '../../../core/services/sale.service';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Sale, CreateSaleRequest } from '../../../core/models/sale.model';
import { User } from '../../../core/models/user.model';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ICONS } from '../../../shared/constants/icons.constant';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafeHtmlPipe, LoadingSpinnerComponent],
  templateUrl: './sales-list.component.html'
})
export class SalesListComponent implements OnInit {
  sales: Sale[] = [];
  branches: any[] = [];
  products: any[] = [];
  loading = false;
  showModal = false;
  saleForm: FormGroup;
  selectedBranchId: string = 'all';
  currentUser: User | null = null;
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  icons = ICONS;

  constructor(
    private saleService: SaleService,
    private branchService: BranchService,
    private productService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.currentUser = this.authService.getCurrentUser();
    
    // Si no es admin, fijar la sucursal del usuario
    const initialBranchId = this.isAdmin() ? '' : (this.currentUser?.branch_id || '');

    this.saleForm = this.fb.group({
      branchId: [initialBranchId, Validators.required],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      total: [0, [Validators.required, Validators.min(0.01)]],
      saleDate: [new Date().toISOString().substring(0, 10), Validators.required]
    });

    // Calcular total automáticamente cuando cambia producto o cantidad
    this.saleForm.get('productId')?.valueChanges.subscribe(id => this.calculateTotal());
    this.saleForm.get('quantity')?.valueChanges.subscribe(q => this.calculateTotal());
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  ngOnInit(): void {
    if (!this.isAdmin() && this.currentUser?.branch_id) {
      this.selectedBranchId = this.currentUser.branch_id.toString();
    }
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.loadSales();
    this.branchService.getAll().subscribe(res => {
      this.branches = res.data || res;
      // Si no es admin y el filtro es 'all', forzar a su sucursal si no se hizo en ngOnInit
      if (!this.isAdmin() && this.selectedBranchId === 'all' && this.currentUser?.branch_id) {
        this.selectedBranchId = this.currentUser.branch_id.toString();
        this.loadSales();
      }
    });
    this.productService.getPaginated({ limit: 100 }).subscribe(res => {
      const items = res.data?.products || res.data?.items || res.data || res;
      this.products = Array.isArray(items) ? items : [];
    });
  }

  loadSales(): void {
    this.loading = true;
    const request = this.selectedBranchId === 'all' 
      ? this.saleService.getAll(this.currentPage, this.pageSize)
      : this.saleService.getByBranch(Number(this.selectedBranchId), this.currentPage, this.pageSize);

    request.subscribe({
      next: (res: any) => {
        this.sales = res.sales;
        this.totalItems = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadSales();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadSales();
    }
  }

  calculateTotal(): void {
    const productId = this.saleForm.get('productId')?.value;
    const quantity = this.saleForm.get('quantity')?.value;
    const product = this.products.find(p => p.id == productId);
    
    if (product && product.price && quantity) {
      this.saleForm.patchValue({ total: product.price * quantity }, { emitEvent: false });
    }
  }

  onBranchFilterChange(): void {
    this.currentPage = 1;
    this.loadSales();
  }

  openModal(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.showModal = true;
    
    const branch_id = this.isAdmin() ? '' : (this.currentUser?.branch_id?.toString() || '');
    
    this.saleForm.reset({
      branchId: branch_id,
      productId: '',
      quantity: 1,
      total: 0,
      saleDate: new Date().toISOString().substring(0, 10)
    });
    
    if (!this.isAdmin()) {
      this.saleForm.get('branchId')?.setValue(branch_id);
      this.saleForm.get('branchId')?.disable();
    } else {
      this.saleForm.get('branchId')?.enable();
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      console.warn('Formulario inválido:', this.saleForm.value);
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    this.loading = true;
    const rawData = this.saleForm.getRawValue();
    
    // Asegurarse de que los valores sean números válidos
    const branchId = Number(rawData.branchId);
    const productId = Number(rawData.productId);
    const quantity = Number(rawData.quantity);
    const total = Number(rawData.total);
    
    if (!branchId || !productId || !quantity || !total) {
      alert('Todos los campos son obligatorios y deben tener valores válidos');
      this.loading = false;
      return;
    }
    
    const payload: any = {
      branch_id: branchId,
      product_id: productId,
      quantity,
      total,
      sale_date: rawData.saleDate
    };

    this.saleService.create(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadSales();
        // Aquí se podría añadir un toast de éxito
      },
      error: (err) => {
        alert(err.error?.message || 'Error al registrar la venta. Verifique el stock.');
        this.loading = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar esta venta? Esto no revertirá el stock automáticamente.')) {
      this.saleService.delete(id).subscribe(() => this.loadSales());
    }
  }
}
