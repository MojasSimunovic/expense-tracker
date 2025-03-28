import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { EChartsCoreOption } from 'echarts/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterModule, MatIcon, RouterLink, NgxEchartsDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true,
  providers: [provideEchartsCore({ echarts }), DatePipe],
})
export class HomeComponent implements OnInit {
  datePipe = inject(DatePipe);
  expenses = signal<Expense[]>([]);
  expenseService = inject(ExpenseService);

  pieChartOptions: any;

  currentMonth = signal<string>('');

  ngOnInit() {
    // Get all expenses from the service and set the Signal
    this.expenseService.getAll().subscribe((data) => {
      this.expenses.set(data); // Set the expenses list
      this.updatePieChart(); // Update the chart after fetching expenses
    });
    this.currentMonth.set(
      this.datePipe.transform(Date.now(), 'MM')?.toString() || ''
    );
  }

  totalAmount = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month

    return this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() + 1; // Extract month from expense.date
        return selectedMonth === '' || expenseMonth === parseInt(selectedMonth);
      })
      .reduce((sum, item) => sum + item.price, 0);
  });

  getPieChartData(categoryTotals: any) {
    return Object.keys(categoryTotals).map((category: string) => ({
      name: category,
      value: categoryTotals[category],
    }));
  }

  calculateCategoryTotals(expenses: Expense[]) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date); // Convert string date to Date object
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    // Calculate totals per category
    return currentMonthExpenses.reduce((acc: any, expense: Expense) => {
      if (acc[expense.category]) {
        acc[expense.category] += expense.price;
      } else {
        acc[expense.category] = expense.price;
      }
      return acc;
    }, {});
  }

  updatePieChart() {
    const categoryTotals = this.calculateCategoryTotals(this.expenses());
    const pieData = this.getPieChartData(categoryTotals);
    this.pieChartOptions = {
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: '50%',
          data: pieData, // Data for the pie chart
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
    echarts.init().setOption(this.pieChartOptions);
  }

  onResize() {
    // Dynamically resize the chart when window is resized
    const chart = echarts.init(document.getElementById('chart')!);
    chart.resize();
  }
}
