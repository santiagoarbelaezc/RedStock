import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-badge-status',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge-status.component.html',
  styleUrl: './badge-status.component.css'
})
export class BadgeStatusComponent {
  @Input() status: string = '';

  get label(): string {
    const labels: Record<string, string> = {
      'PENDING': 'Pendiente',
      'IN_TRANSIT': 'En Tránsito',
      'COMPLETED': 'Completado',
      'CANCELLED': 'Cancelado',
      'low': 'Stock Bajo'
    };
    return labels[this.status] || this.status;
  }

  get badgeClass(): string {
    const styles: Record<string, string> = {
      'PENDING': 'bg-amber-50 text-amber-600 border-amber-100',
      'IN_TRANSIT': 'bg-blue-50 text-blue-600 border-blue-100',
      'COMPLETED': 'bg-green-50 text-green-600 border-green-100',
      'CANCELLED': 'bg-red-50 text-red-600 border-red-100',
      'low': 'bg-red-50 text-red-600 border-red-100'
    };
    return styles[this.status] || 'bg-gray-50 text-gray-600 border-gray-100';
  }
}
