import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent {
  name = '';
  sku = '';
  description = '';
  loading = false;
  error = '';

  constructor(public router: Router, private http: HttpClient) {}

  onSubmit() {
    if (!this.name || !this.sku) return;
    this.loading = true;
    this.error = '';
    
    this.http.post<any>(`${environment.apiUrl}/products`, {
      name: this.name,
      sku: this.sku,
      description: this.description
    }).subscribe({
      next: () => this.router.navigate(['/products']),
      error: (e: any) => { 
        this.error = e?.error?.message || 'Error al crear producto'; 
        this.loading = false; 
      }
    });
  }
}
