import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransferService } from '../../../core/services/transfer.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-transfer-confirm',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, LoadingSpinnerComponent],
  templateUrl: './transfer-confirm.component.html',
  styleUrl: './transfer-confirm.component.css'
})
export class TransferConfirmComponent implements OnInit {
  transferId!: number;
  transfer: any = null;
  items: any[] = [];
  loading = true;
  loadingConfirm = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private transferService: TransferService
  ) {}

  ngOnInit() {
    this.transferId = +this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.transferService.getByBranch(0).subscribe({ // get all for now or filter by ID if service supports it
      next: (res: any) => {
        this.transfer = (res.data || []).find((t: any) => t.id === this.transferId);
        if (this.transfer) {
          this.items = (this.transfer.items || []).map((i: any) => ({ ...i, _receivedQty: i.requested_quantity }));
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onConfirm() {
    this.loadingConfirm = true;
    const itemsToConfirm = this.items.map(i => ({
      inventoryId: i.id, // This should be the destination inventory Id or the transfer item id
      quantity: i._receivedQty
    }));

    this.transferService.confirmReception(this.transferId, itemsToConfirm).subscribe({
      next: () => this.router.navigate(['/transfers']),
      error: () => this.loadingConfirm = false
    });
  }
}
