import { Component, Input } from '@angular/core';
import { NgIf, NgClass, DecimalPipe } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgIf, NgClass, DecimalPipe, SafeHtmlPipe],
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

  get isSvgIcon(): boolean {
    return this.icon.includes('<svg');
  }
}
