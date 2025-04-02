import { Component, ElementRef } from '@angular/core';
import { NgStyle } from '@angular/common';
import { bottom } from '@popperjs/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-qr-button',
  imports: [NgStyle,RouterLink],
  templateUrl: './qr-button.component.html',
  styleUrl: './qr-button.component.css'
})
export class QrButtonComponent {
  isFooterVisible = false;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    window.addEventListener('scroll', this.checkFooterVisibility.bind(this));
  }

  checkFooterVisibility() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const rect = footer.getBoundingClientRect();
    this.isFooterVisible = rect.top < window.innerHeight;
  }

  updateBtnStyle() {
    return {
      bottom: this.isFooterVisible ? '6.5em' : '1em',
    };
  }
}
