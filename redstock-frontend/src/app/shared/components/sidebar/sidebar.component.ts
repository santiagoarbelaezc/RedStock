import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ICONS } from '../../constants/icons.constant';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, NgClass, SafeHtmlPipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isCollapsed = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  menuItems = [
    { label: 'Global', path: '/superadmin', icon: ICONS.analytics, roles: ['superadmin'] },
    { label: 'Usuarios', path: '/users', icon: ICONS.products, roles: ['admin', 'superadmin'] },
    { label: 'Inventario', path: '/inventory', icon: ICONS.inventory, roles: ['admin', 'employee', 'superadmin'] },
    { label: 'Productos', path: '/products', icon: ICONS.products, roles: ['admin', 'superadmin'] },
    { label: 'Ventas', path: '/sales', icon: ICONS.analytics, roles: ['admin', 'employee'] },
    { label: 'Traslados', path: '/transfers', icon: ICONS.transfers, roles: ['admin', 'employee'] },
    { label: 'Movimientos', path: '/movements', icon: ICONS.inventory, roles: ['admin'] },
    { label: 'Analíticas', path: '/analytics', icon: ICONS.analytics, roles: ['admin', 'superadmin'] },
    { label: 'Sucursales', path: '/branches', icon: ICONS.branches, roles: ['superadmin'] },
  ];

  get filteredMenuItems() {
    return this.menuItems.filter(item => 
      !item.roles || item.roles.includes(this.authService.getCurrentUserRole())
    );
  }
}
