import { Directive, effect, ElementRef, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appTheme]'
})
export class ThemeDirective {
  private el = inject(ElementRef);
  private preferencesService = inject(AuthService);
  
  constructor() {
    // Use effect to reactively update theme classes
    effect(() => {
      const isDark = this.preferencesService.isDarkMode();
      const element = this.el.nativeElement as HTMLElement;
      
      if (isDark) {
        element.classList.add('dark');
        element.classList.remove('light');
      } else {
        element.classList.add('light');
        element.classList.remove('dark');
      }
      // Also set data attribute for CSS custom properties
      element.setAttribute('data-theme', isDark ? 'dark' : 'light');
    });
  }
}
