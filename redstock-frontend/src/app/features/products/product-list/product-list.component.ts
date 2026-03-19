import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, NgFor, DatePipe, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  loading = true;

  constructor(private http: HttpClient, public router: Router) {}

  ngOnInit() {
    this.http.get<any>(`${environment.apiUrl}/products`).subscribe({
      next: (res: any) => { 
        this.products = res.data || []; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }
}
