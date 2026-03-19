import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon = '🔍';
  @Input() title = 'No se encontraron resultados';
  @Input() message = 'Intenta ajustar tus filtros o buscar algo diferente.';
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
