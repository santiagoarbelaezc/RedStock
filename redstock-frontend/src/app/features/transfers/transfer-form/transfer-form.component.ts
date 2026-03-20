import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { TransferService } from '../../../core/services/transfer.service';
import { BranchService } from '../../../core/services/branch.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-transfer-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './transfer-form.component.html',
  styleUrl: './transfer-form.component.css'
})
export class TransferFormComponent implements OnInit {
  transferForm: FormGroup;
  branches: any[] = [];
  selectedOriginBranchInventory: any[] = [];
  loading = false;

  get myBranchId() { 
    const u = this.auth.getCurrentUser();
    return u?.branch_id || u?.branchId || 1; 
  }
  
  get myBranchName() { 
    return this.auth.getCurrentUser()?.branchName || 'Mi Sucursal'; 
  }

  get items() {
    return this.transferForm.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private transferService: TransferService,
    private branchService: BranchService,
    private inventoryService: InventoryService,
    private auth: AuthService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.transferForm = this.fb.group({
      originBranchId: ['', Validators.required],
      items: this.fb.array([], Validators.required)
    });
  }

  ngOnInit() {
    this.loadBranches();
    
    // Auto-completado desde parámetros de URL
    this.route.queryParams.subscribe(params => {
      const fromBranchId = params['fromBranchId'];
      const productId = params['productId'];

      if (fromBranchId) {
        this.transferForm.patchValue({ originBranchId: fromBranchId });
        this.loadBranchInventory(fromBranchId, productId);
      }
    });
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (res: any) => this.branches = res.data || []
    });
  }

  loadBranchInventory(branchId: number, preselectProductId?: any) {
    // Pedimos el inventario de la sucursal origen (un poco más de lo normal para asegurar que el producto esté)
    this.inventoryService.getByBranch(branchId, 1, 100).subscribe({
      next: (res: any) => {
        const inventoryData = res.data?.inventory || res.data || [];
        this.selectedOriginBranchInventory = inventoryData.filter((i: any) => i.quantity > 0);
        
        if (preselectProductId) {
          this.items.clear();
          const itemForm = this.fb.group({
            productId: [+preselectProductId, Validators.required],
            requestedQty: [1, [Validators.required, Validators.min(1)]]
          });
          this.items.push(itemForm);
        }
      }
    });
  }

  onOriginBranchChange() {
    const originId = this.transferForm.get('originBranchId')?.value;
    if (!originId) return;
    this.loadBranchInventory(originId);
  }

  addItem() {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      requestedQty: [1, [Validators.required, Validators.min(1)]]
    });
    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  onSubmit() {
    if (this.transferForm.invalid) return;
    this.loading = true;

    const { originBranchId, items } = this.transferForm.value;
    this.transferService.create(originBranchId, this.myBranchId, items).subscribe({
      next: () => this.router.navigate(['/transfers']),
      error: () => this.loading = false
    });
  }
}
