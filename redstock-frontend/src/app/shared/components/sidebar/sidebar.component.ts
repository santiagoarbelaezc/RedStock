import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, NgClass],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Inventario', path: '/inventory', icon: '📦' },
    { label: 'Traslados', path: '/transfers', icon: '🔄' },
    { label: 'Sucursales', path: '/branches', icon: '🏠' },
    { label: 'Catálogo', path: '/products', icon: '🧪' },
    { label: 'Analíticas', path: '/analytics', icon: '📈' },
  ];
}
