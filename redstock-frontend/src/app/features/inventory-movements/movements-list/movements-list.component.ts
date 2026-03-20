import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryMovementService } from '../../../core/services/inventory-movement.service';
import { BranchService } from '../../../core/services/branch.service';
import { ProductService } from '../../../core/services/product.service';
import { InventoryMovement } from '../../../core/models/inventory-movement.model';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { ICONS } from '../../../shared/constants/icons.constant';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-movements-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SafeHtmlPipe, LoadingSpinnerComponent],
  templateUrl: './movements-list.component.html'
})
export class MovementsListComponent implements OnInit {
  movements: InventoryMovement[] = [];
  branches: any[] = [];
  products: any[] = [];
  loading = false;
  showModal = false;
  movementForm: FormGroup;
  selectedBranchId: string = 'all';
  
  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  icons = ICONS;

  constructor(
    private movementService: InventoryMovementService,
    private branchService: BranchService,
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.movementForm = this.fb.group({
      branchId: ['', Validators.required],
      productId: ['', Validators.required],
      type: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      referenceId: [null],
      referenceType: ['']
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading = true;
    this.loadMovements();
    this.branchService.getAll().subscribe(res => this.branches = res.data || res);
    this.productService.getPaginated({ limit: 100 }).subscribe(res => {
      const items = res.data?.products || res.data?.items || res.data || res;
      this.products = Array.isArray(items) ? items : [];
    });
  }

  loadMovements(): void {
    this.loading = true;
    const request = this.selectedBranchId === 'all'
      ? this.movementService.getAll(this.currentPage, this.pageSize)
      : this.movementService.getByBranch(Number(this.selectedBranchId), this.currentPage, this.pageSize);

    request.subscribe({
      next: (res: any) => {
        this.movements = res.movements;
        this.totalItems = res.pagination.total;
        this.totalPages = res.pagination.totalPages;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadMovements();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMovements();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMovements();
    }
  }

  openModal(): void {
    this.showModal = true;
    this.movementForm.reset({ quantity: 1 });
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.movementForm.invalid) return;

    this.loading = true;
    const rawData = this.movementForm.getRawValue();
    const payload: InventoryMovement = {
      branch_id: Number(rawData.branchId),
      product_id: Number(rawData.productId),
      type: rawData.type,
      quantity: rawData.quantity,
      reference_id: rawData.referenceId ? Number(rawData.referenceId) : undefined,
      reference_type: rawData.referenceType || undefined
    };

    this.movementService.create(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadMovements();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al registrar el movimiento.');
        this.loading = false;
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este registro? Esto no revertirá el stock automáticamente.')) {
      this.movementService.delete(id).subscribe(() => this.loadMovements());
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-700';
      case 'OUT': return 'bg-red-100 text-red-700';
      case 'TRANSFER_IN': return 'bg-blue-100 text-blue-700';
      case 'TRANSFER_OUT': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'IN': return 'Entrada';
      case 'OUT': return 'Salida';
      case 'TRANSFER_IN': return 'Transf. Recibida';
      case 'TRANSFER_OUT': return 'Transf. Enviada';
      default: return type;
    }
  }
}
