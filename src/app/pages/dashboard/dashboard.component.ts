import { Component, effect, signal, Signal } from '@angular/core';
import { OnInit } from '@angular/core';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';
import { Observable } from 'rxjs';
import { NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [NgFor, CommonModule, MatTableModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  expenses$?: Observable<Expense[]>;

  filteredExpenses?: Expense[] = [];
  category = signal('All');
  constructor(private expenseService: ExpenseService, private router: Router) {}
  ngOnInit(): void {
    this.expenses$ = this.expenseService.getAll();
  }
  private efektRef = effect(() => {
    this.filterExpenses(this.category());
  });

  setFilter(e: any) {
    this.category.set(e.value);
  }

  filterExpenses(category: string) {
    if (category === 'All') {
      this.filteredExpenses = [];
      this.expenses$?.subscribe((data) => {
        this.filteredExpenses = data;
      });
      return;
    } else {
      this.expenses$?.subscribe((expenses) => {
        this.filteredExpenses = expenses.filter(
          (expense) => expense.category === category
        );
      });
    }
  }

  onDelete(id: string) {
    this.expenseService
      .deleteExpense(id)
      .then(() => console.log('Expense deleted successfully'))
      .catch((error) => console.error('Error deleting expense:', error));
  }
  onEdit(expense: Expense) {
    this.router.navigate([`new/${expense.id}`]);
    console.log(expense);
  }

  navigateToNew() {
    this.router.navigate(['new']);
  }
}
