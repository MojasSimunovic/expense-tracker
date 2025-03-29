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

@Component({
  selector: 'app-home',
  imports: [RouterModule, MatIcon, RouterLink, ChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [provideEchartsCore({ echarts }), DatePipe],
})
export class HomeComponent  {

}
