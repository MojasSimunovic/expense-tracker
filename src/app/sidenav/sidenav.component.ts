import { Component, EventEmitter } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgIf, NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Input, Output } from '@angular/core';

@Component({
  selector: 'side-nav',
  imports: [
    MatSidenavModule,
    NgFor,
    NgIf,
    MatIconModule,
    MatListModule,
    RouterModule,
    RouterLink,
    MatTooltipModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css',
})
export class SidenavComponent {
  @Input() isExpanded?: boolean;
  @Output() toggleMenu = new EventEmitter();

  public routeLinks = [
    { link: '', name: 'Home', icon: 'home' },
    { link: 'dashboard', name: 'Dashboard', icon: 'dashboard' },
  ];
}
