import { Component, Input } from '@angular/core';
import { NgIf, NgClass, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgIf, NgClass, DecimalPipe],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.css'
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number | null = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() change?: number;

  protected readonly Math = Math;
}
