import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { TransferService } from '../../../core/services/transfer.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';

@Component({
  selector: 'app-transfer-confirm',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf, DatePipe, LoadingSpinnerComponent, BadgeStatusComponent],
  templateUrl: './transfer-confirm.component.html',
  styleUrl: './transfer-confirm.component.css'
})
export class TransferConfirmComponent implements OnInit {
  transfer: any = null;
  confirmForm: FormGroup;
  loading = true;
  submitting = false;

  get items() {
    return this.confirmForm.get('items') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private transferService: TransferService,
    protected router: Router
  ) {
    this.confirmForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.transferService.getById(id).subscribe({
      next: (res: any) => {
        this.transfer = res.data;
        this.initForm(res.data.items || []);
        this.loading = false;
      },
      error: () => this.router.navigate(['/transfers'])
    });
  }

  initForm(items: any[]) {
    items.forEach(item => {
      this.items.push(this.fb.group({
        itemId: [item.id],
        productName: [item.product_name],
        sku: [item.sku],
        requestedQty: [item.requested_qty],
        receivedQty: [item.requested_qty, [Validators.required, Validators.min(0)]],
        notes: ['']
      }));
    });
  }

  onSubmit() {
    if (this.confirmForm.invalid) return;
    this.submitting = true;

    const data = this.confirmForm.value.items.map((i: any) => ({
      itemId: i.itemId,
      receivedQty: i.receivedQty,
      notes: i.notes
    }));

    this.transferService.confirmReception(this.transfer.id, data).subscribe({
      next: () => this.router.navigate(['/transfers']),
      error: () => this.submitting = false
    });
  }
}
