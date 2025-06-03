import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { EChartsCoreOption } from 'echarts/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { DatePipe } from '@angular/common';
import { ChartComponent } from "../../components/chart/chart.component";
import { CardComponent } from '../../components/card/card.component';

@Component({
  selector: 'app-home',
  imports: [RouterModule, ChartComponent,RouterLink, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [provideEchartsCore({ echarts }), DatePipe],
})
export class HomeComponent  {
  cards = [
    {
      title: 'Dashboard',
      text: 'View comprehensive insights and analytics of your spending patterns',
      icon: '📊',
      link: '/dashboard'
    },
    {
      title: 'Scan QR Code',
      text:'Instantly capture expense data by scanning bill QR codes',
      icon: '📱',
      link: '/qr'
    },
    {
      title: 'New expense',
      text: 'Manually add new expenses with detailed categorization',
      icon: '➕',
      link:'/new'
    },
  ]
}
