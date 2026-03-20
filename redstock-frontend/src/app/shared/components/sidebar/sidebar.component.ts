import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { ICONS } from '../../constants/icons.constant';

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

  menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: ICONS.dashboard },
    { label: 'Inventario', path: '/inventory', icon: ICONS.inventory },
    { label: 'Traslados', path: '/transfers', icon: ICONS.transfers },
    { label: 'Sucursales', path: '/branches', icon: ICONS.branches },
    { label: 'Productos', path: '/products', icon: ICONS.products },
    { label: 'Analíticas', path: '/analytics', icon: ICONS.analytics },
  ];
}
