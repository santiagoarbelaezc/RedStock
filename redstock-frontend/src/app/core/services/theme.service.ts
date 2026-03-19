import { Injectable } from '@angular/core';

const ACCENT_KEY = 'rs_accent_color';
const DEFAULT_ACCENT = '#2563EB';

export const ACCENT_OPTIONS = [
  { label: 'Azul',    value: '#2563EB', light: '#EFF6FF' },
  { label: 'Verde',   value: '#16A34A', light: '#F0FDF4' },
  { label: 'Violeta', value: '#7C3AED', light: '#F5F3FF' },
  { label: 'Naranja', value: '#EA580C', light: '#FFF7ED' },
  { label: 'Rosa',    value: '#DB2777', light: '#FDF2F8' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentAccent = DEFAULT_ACCENT;

  constructor() {
    this.applyAccent(localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT);
  }

  getAccentColor(): string {
    return this.currentAccent;
  }

  setAccentColor(color: string): void {
    const option = ACCENT_OPTIONS.find(o => o.value === color);
    this.applyAccent(color, option?.light);
    localStorage.setItem(ACCENT_KEY, color);
  }

  private applyAccent(color: string, light?: string): void {
    this.currentAccent = color;
    document.documentElement.style.setProperty('--accent-color', color);
    document.documentElement.style.setProperty('--accent-light', light || '#EFF6FF');
  }
}
