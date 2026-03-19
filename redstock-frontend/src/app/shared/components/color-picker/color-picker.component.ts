import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [NgFor],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.css'
})
export class ColorPickerComponent {
  colors = ['#000000', '#2563EB', '#7C3AED', '#DB2777', '#059669'];

  constructor(private themeService: ThemeService) {}

  get currentColor() {
    return this.themeService.getAccentColor();
  }

  setAccent(color: string) {
    this.themeService.setAccentColor(color);
  }
}
