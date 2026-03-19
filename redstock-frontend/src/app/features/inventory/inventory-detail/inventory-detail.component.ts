import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, LoadingSpinnerComponent, ConfirmModalComponent],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.css'
})
export class InventoryDetailComponent implements OnInit {
  branchId!: number;
  branchName = '';
  items: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private inventoryService: InventoryService
  ) {}

  ngOnInit() {
    this.branchId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.inventoryService.getByBranch(this.branchId).subscribe({
      next: (res: any) => {
        this.items = (res.data || []).map((i: any) => ({ ...i, _newQty: i.quantity }));
        if (this.items.length > 0) this.branchName = this.items[0].branch_name;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  updateQty(item: any) {
    if (item._newQty === undefined || item._newQty === item.quantity) return;
    this.inventoryService.updateQuantity(this.branchId, item.id, item._newQty).subscribe({
      next: () => {
        item.quantity = item._newQty;
      }
    });
  }
}
