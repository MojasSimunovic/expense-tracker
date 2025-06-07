import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../services/expense.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-expense-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expense-comparison.component.html',
  styleUrl: './expense-comparison.component.css',
})
export class ExpenseComparisonComponent {
  private expenseService = inject(ExpenseService);
  private authService = inject(AuthService);

  expenses = toSignal(this.expenseService.getAll());
  isDarkMode = this.authService.isDarkMode;

  currentMonthTotal = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (
      this.expenses()?.reduce((total, expense) => {
        const expenseDate = new Date(expense.date);
        if (
          expenseDate.getMonth() === currentMonth &&
          expenseDate.getFullYear() === currentYear
        ) {
          return total + expense.price;
        }
        return total;
      }, 0) || 0
    );
  });

  previousMonthTotal = computed(() => {
    const now = new Date();
    const previousMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const previousYear =
      now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    return (
      this.expenses()?.reduce((total, expense) => {
        const expenseDate = new Date(expense.date);
        if (
          expenseDate.getMonth() === previousMonth &&
          expenseDate.getFullYear() === previousYear
        ) {
          return total + expense.price;
        }
        return total;
      }, 0) || 0
    );
  });

  percentageChange = computed(() => {
    const current = this.currentMonthTotal();
    const previous = this.previousMonthTotal();

    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  });
}
