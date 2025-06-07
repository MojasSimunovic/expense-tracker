import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { DatePipe } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense';
import { subMonths, format } from 'date-fns';
import { AuthService } from '../../services/auth.service';
import { color } from 'echarts';

@Component({
  selector: 'app-chart',
  imports: [NgxEchartsDirective, CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
  providers: [provideEchartsCore({ echarts }), DatePipe],
})
export class ChartComponent implements OnInit {
  themeService = inject(AuthService);
  datePipe = inject(DatePipe);
  expenses = signal<Expense[]>([]);
  expenseService = inject(ExpenseService);
  pieChartOptions: any;

  lineChartOptions: any;

  currentMonth = signal<string>('');

  lastMonthTotal?: number;

  secondToLastTotal?: number;

  isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  ngOnInit(): void {
    // Get all expenses from the service and set the Signal
    this.expenseService.getAll().subscribe((data) => {
      this.expenses.set(data);
      this.updatePieChart();
      this.updateLineChart();
    });
    this.currentMonth.set(
      this.datePipe.transform(Date.now(), 'MM')?.toString() || ''
    );
  }

  constructor() {
    effect(() => {
      console.log(this.themeService.isDarkMode());
      this.updatePieChart();
      this.updateLineChart();
    });
  }
  totalAmount = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month
    const total = this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() + 1; // Extract month from expense.date
        return selectedMonth === '' || expenseMonth === parseInt(selectedMonth);
      })
      .reduce((sum, item) => sum + item.price, 0);
    return parseFloat(total.toFixed(2));
  });

  previousMonthTotal = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month
    const previousMonth = (parseInt(selectedMonth) - 1 + 12) % 12 || 12; // Ensure it wraps around for January
    const previousMonthStr = String(previousMonth).padStart(2, '0');
    const total = this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() + 1; // Extract month from expense.date
        return (
          previousMonthStr === '' || expenseMonth === parseInt(previousMonthStr)
        );
      })
      .reduce((sum, item) => sum + item.price, 0);
    return parseFloat(total.toFixed(2));
  });

  secondToLastMonthTotal = computed(() => {
    const selectedMonth = this.currentMonth(); // Get selected month
    const previousMonth = (parseInt(selectedMonth) - 2 + 12) % 12 || 12; // Ensure it wraps around for January
    const previousMonthStr = String(previousMonth).padStart(2, '0');
    const total = this.expenses()
      .filter((expense) => {
        const expenseMonth = new Date(expense.date).getMonth() + 1; // Extract month from expense.date
        return (
          previousMonthStr === '' || expenseMonth === parseInt(previousMonthStr)
        );
      })
      .reduce((sum, item) => sum + item.price, 0);
    return parseFloat(total.toFixed(2));
  });

  getPieChartData(categoryTotals: any) {
    return Object.keys(categoryTotals).map((category: string) => ({
      name: category,
      value: parseFloat(categoryTotals[category].toFixed(2)),
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
      title: {
        text: `Current Month Total: RSD ${this.totalAmount()}`,
        fontFamily: 'JetBrains Mono',
        left: 'center',
        textStyle: {
          color: this.isDarkMode() ? '#ffffff' : '#333333',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: this.isDarkMode() ? '#1f1f1f' : '#ffffff',
        borderColor: this.isDarkMode() ? '#444' : '#ccc',
        textStyle: {
          color: this.isDarkMode() ? '#ffffff' : '#333333',
        },
      },
      legend: {
        bottom: '0%',
        left: 'center',
        itemGap: 10,
        textStyle: {
          fontSize: 12,
          color: this.themeService.isDarkMode() ? '#ffffff' : '#333333',
        },
      },
      series: [
        {
          name: 'Expenses',
          type: 'pie',
          radius: ['50%', '80%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          data: pieData,
          label: {
            show: false,
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          labelLine: { show: false },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: () => Math.random() * 200,
          },
        },
      ],
    };
  }

  updateLineChart() {
    const now = new Date();
    const currentDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    this.lineChartOptions = {
      title: {
        text: 'Total Expenses (Last 3 Months)',
        textStyle: {
          color: this.isDarkMode() ? '#ffffff' : '#333333',
        },
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: this.isDarkMode() ? '#ffffff' : '#333333',
          },
        },
        backgroundColor: this.isDarkMode() ? '#1f1f1f' : '#ffffff',
        borderColor: this.isDarkMode() ? '#444' : '#ccc',
        textStyle: {
          color: this.isDarkMode() ? '#ffffff' : '#333333',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: this.isDarkMode() ? '#e0e6ed' : '#333333',
        },
        axisLine: {
          lineStyle: {
            color: this.isDarkMode() ? '#444' : '#e0e6ed',
          },
        },
        data: [
          format(subMonths(currentDate, 2), 'MMMM'),
          format(subMonths(currentDate, 1), 'MMMM'),
          format(currentDate, 'MMMM'),
        ],
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontFamily: 'JetBrains Mono',
          color: this.themeService.isDarkMode() ? '#ffffff' : '#333333',
        },
        axisLine: {
          lineStyle: {
            color: this.themeService.isDarkMode() ? '#444' : '#ccc',
          },
        },
      },
      series: [
        {
          name: 'Total Expenses',
          type: 'line',
          symbol: 'circle',
          symbolSize: 9,
          smooth: true,
          lineStyle: {
            width: 4,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' },
            ]),
          },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#6366f1' },
              { offset: 1, color: '#8b5cf6' },
            ]),
            borderRadius: [8, 8, 0, 0],
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' },
            ]),
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#5a67d8',
              borderColor: '#fff',
              borderWidth: 4,
              shadowBlur: 10,
              shadowColor: 'rgba(102, 126, 234, 0.5)',
            },
          },
          data: [
            this.secondToLastMonthTotal(),
            this.previousMonthTotal(),
            this.totalAmount(),
          ],
          color: '#41cf8d',
          animationDuration: 2000,
          animationEasing: 'cubicOut',
        },
      ],
    };
  }
  onResize() {
    const chart = echarts.init(document.getElementById('chart')!);
    chart.resize();
  }
}
