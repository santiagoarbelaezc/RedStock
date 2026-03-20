import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
import { TransferService } from '../../../core/services/transfer.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';

@Component({
  selector: 'app-transfer-detail',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, CurrencyPipe, LoadingSpinnerComponent, BadgeStatusComponent, RouterLink],
  templateUrl: './transfer-detail.component.html'
})
export class TransferDetailComponent implements OnInit {
  transfer: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private transferService: TransferService,
    protected router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.transferService.getById(id).subscribe({
      next: (res: any) => {
        this.transfer = res.data;
        this.loading = false;
      },
      error: () => this.router.navigate(['/transfers'])
    });
  }

  deleteTransfer() {
    if (!confirm('¿Estás seguro de que deseas eliminar este traslado?')) return;
    this.transferService.delete(this.transfer.id).subscribe({
      next: () => this.router.navigate(['/transfers'])
    });
  }
}
