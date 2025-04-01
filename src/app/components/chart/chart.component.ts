import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { EChartsCoreOption } from 'echarts/core';
import { DatePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { subMonths, format } from 'date-fns';

@Component({
  selector: 'app-chart',
  imports: [ NgxEchartsDirective, CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
  providers: [provideEchartsCore({ echarts }), DatePipe],
})
export class ChartComponent implements OnInit {
  datePipe = inject(DatePipe);
  expenses = signal<Expense[]>([]);
  expenseService = inject(ExpenseService);
  pieChartOptions: any;

  barChartOptions: any;

  currentMonth = signal<string>('');

  lastMonthTotal?: number;

  secondToLastTotal?: number;

  ngOnInit(): void {
        // Get all expenses from the service and set the Signal
        this.expenseService.getAll().subscribe((data) => {
          this.expenses.set(data);
          this.updatePieChart(); 
          this.updateBarChart();
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

  previousMonthTotal = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month
    const previousMonth = ((parseInt(selectedMonth) - 1 + 12) % 12) || 12; // Ensure it wraps around for January
    const previousMonthStr = String(previousMonth).padStart(2, '0'); 
    return this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() +1; // Extract month from expense.date
        return previousMonthStr === '' || expenseMonth === parseInt(previousMonthStr);
      })
      .reduce((sum, item) => sum + item.price, 0);
  });

  secondToLastMonthTotal = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month
    const previousMonth = ((parseInt(selectedMonth) - 2 + 12) % 12) || 12; // Ensure it wraps around for January
    const previousMonthStr = String(previousMonth).padStart(2, '0'); 
    return this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() +1; // Extract month from expense.date
        return previousMonthStr === '' || expenseMonth === parseInt(previousMonthStr);
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
      title: { text: `Current Month Total: RSD ${this.totalAmount()}`, left: 'center' },
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
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx: any) {
              return Math.random() * 200;
            }
          },
        },
      ],
    };
    const echart = document.querySelector('.echart-container') as HTMLElement;
    if (echart) {
      echarts.init(echart).setOption(this.pieChartOptions);
    }
  }

  updateBarChart() {
    this.barChartOptions = {
      title: { text: 'Total Expenses (Last 3 Months)', left: 'center' },
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category', 
        data: [format(subMonths(this.currentMonth(), 2), 'MMMM'),format(subMonths(this.currentMonth(), 1), 'MMMM') , format(this.currentMonth(), 'MMMM')] // X-axis labels
      },
      yAxis: { type: 'value' }, // Y-axis for expense amounts
      series: [{
        name: 'Total Expenses',
        type: 'bar',
        data: [this.secondToLastMonthTotal(), this.previousMonthTotal(), this.totalAmount()], // Dummy data: Total expenses per month
        color: '#41cf8d' // Bar color
      }]
    };
  }
  onResize() {
      // Dynamically resize the chart when window is resized
    const chart = echarts.init(document.getElementById('chart')!);
    chart.resize();
  }
}
