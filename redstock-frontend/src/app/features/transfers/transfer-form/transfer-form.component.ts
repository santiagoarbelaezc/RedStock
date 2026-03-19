import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    public router: Router
  ) {
    this.transferForm = this.fb.group({
      originBranchId: ['', Validators.required],
      items: this.fb.array([], Validators.required)
    });
  }

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (res: any) => this.branches = res.data || []
    });
  }

  onOriginBranchChange() {
    const originId = this.transferForm.get('originBranchId')?.value;
    if (!originId) return;

    this.items.clear();
    this.inventoryService.getByBranch(originId).subscribe({
      next: (res: any) => {
        this.selectedOriginBranchInventory = (res.data || []).filter((i: any) => i.quantity > 0);
      }
    });
  }

  addItem() {
    const itemForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
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
