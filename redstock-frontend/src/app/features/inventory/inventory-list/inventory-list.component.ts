import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgClass, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { BranchService } from '../../../core/services/branch.service';
import { AuthService } from '../../../core/services/auth.service';
import { ICONS } from '../../../shared/constants/icons.constant';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, DecimalPipe, DatePipe, FormsModule, BadgeStatusComponent, LoadingSpinnerComponent, EmptyStateComponent, SafeHtmlPipe],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css'
})
export class InventoryListComponent implements OnInit {
  inventory: any[] = [];
  branches: any[] = [];
  selectedBranchId: number | string = '';
  loading = true;
  protected icons = ICONS;

  get myBranchId() { 
    const u = this.auth.getCurrentUser();
    return u?.branch_id || u?.branchId || 1; 
  }

  constructor(
    private inventoryService: InventoryService,
    private branchService: BranchService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.branchService.getAll().subscribe({ 
      next: (res: any) => this.branches = res.data || [] 
    });
    this.loadInventory();
  }

  loadInventory() {
    this.loading = true;
    const req$ = this.selectedBranchId
      ? this.inventoryService.getByBranch(+this.selectedBranchId)
      : this.inventoryService.getAllBranches();
    
    req$.subscribe({
      next: (res: any) => { 
        this.inventory = res.data || []; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}
