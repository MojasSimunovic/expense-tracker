import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ChartComponent } from '../../components/chart/chart.component';
import { CardComponent } from '../../components/card/card.component';
import { ExpenseComparisonComponent } from '../../components/expense-comparison/expense-comparison.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterModule,
    ChartComponent,
    RouterLink,
    CardComponent,
    ExpenseComparisonComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [DatePipe],
})
export class HomeComponent {
  cards = [
    {
      title: 'Dashboard',
      text: 'View comprehensive insights and analytics of your spending patterns',
      icon: '📊',
      link: '/dashboard',
    },
    {
      title: 'Scan QR Code',
      text: 'Instantly capture expense data by scanning bill QR codes',
      icon: '📱',
      link: '/qr',
    },
    {
      title: 'New expense',
      text: 'Manually add new expenses with detailed categorization',
      icon: '➕',
      link: '/new',
    },
  ];
}
