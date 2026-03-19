import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, DatePipe } from '@angular/common';
import { TransferService } from '../../../core/services/transfer.service';
import { AuthService } from '../../../core/services/auth.service';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-transfer-list',
  standalone: true,
  imports: [RouterLink, NgFor, DatePipe, BadgeStatusComponent, LoadingSpinnerComponent, EmptyStateComponent, SafeHtmlPipe],
  templateUrl: './transfer-list.component.html',
  styleUrl: './transfer-list.component.css'
})
export class TransferListComponent implements OnInit {
  transfers: any[] = [];
  loading = true;
  protected icons = ICONS;

  get myBranchId() { 
    const u = this.auth.getCurrentUser();
    return u?.branch_id || u?.branchId || 1; 
  }

  constructor(private transferService: TransferService, private auth: AuthService) {}

  ngOnInit() {
    this.transferService.getByBranch(this.myBranchId).subscribe({
      next: (res: any) => { 
        this.transfers = res.data || []; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}
