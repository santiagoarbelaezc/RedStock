import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { BranchService } from '../../../core/services/branch.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ICONS } from '../../../shared/constants/icons.constant';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, LoadingSpinnerComponent, SafeHtmlPipe],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.css'
})
export class BranchListComponent implements OnInit {
  branches: any[] = [];
  loading = true;
  protected icons = ICONS;

  constructor(private branchService: BranchService) {}

  ngOnInit() {
    this.branchService.getAll().subscribe({
      next: (res: any) => { 
        this.branches = res.data || []; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}
