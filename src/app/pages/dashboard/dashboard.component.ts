import {
  Component,
  computed,
  effect,
  inject,
  signal,
  Signal,
} from '@angular/core';
import { OnInit } from '@angular/core';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { DatePipe, NgFor } from '@angular/common';
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
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
  datePipe = inject(DatePipe);
  expenses = signal<Expense[]>([]); // Stores all expenses
  category = signal<string>('All'); // Stores selected category

  searchInput = signal<string>('');

  currentMonth = signal<string>('');

  filteredExpenses = computed(() => {
    const category = this.category();
    const selectedMonth = this.currentMonth(); // Get the selected month
    const searchInput = this.searchInput();
    // Filter by category and month
    return this.expenses().filter((expense) => {
      const expenseMonth = new Date(expense.date).getMonth() + 1; // Get the month from the expense (1-based)
      // check for the search input text
      const isSearched = 
        expense.title.toLowerCase().includes(searchInput);
      // Check if both category and month match
      const isCategoryMatch =
        category === 'All' || expense.category === category;
      const isMonthMatch =
        selectedMonth === '' || expenseMonth === parseInt(selectedMonth); // Handle empty currentMonth

      return isCategoryMatch && isMonthMatch && isSearched;
    });
  });

  totalAmount = computed(() =>
    this.filteredExpenses().reduce((sum, item) => sum + item.price, 0)
  );

  constructor(private expenseService: ExpenseService, private router: Router) {}

  ngOnInit(): void {
    this.expenseService.getAll().subscribe((data) => {
      this.expenses.set(data);
    });
    this.currentMonth.set(
      this.datePipe.transform(Date.now(), 'MM')?.toString() || ''
    );
    setTimeout(() => {
      console.log(this.expenses());
    }, 600);
   
  }

  setFilter(e: any) {
    this.category.set(e.value);
  }

  setFilterMonth(e: any) {
    this.currentMonth.set(e.value);
  }

  onDelete(id: string) {
    this.expenseService
      .deleteExpense(id)
      .then(() => console.log('Expense deleted successfully'))
      .catch((error) => console.error('Error deleting expense:', error));
  }

  updateExpense(expense: Expense) {
    this.expenseService.updateExpense(expense, expense.id);
  }

  onEdit(expense: Expense) {
    this.router.navigate([`new/${expense.id}`]);
  }

  navigateToNew() {
    this.router.navigate(['new']);
  }

  applySearch(event: Event) {
    let searchTerm = (event.target as HTMLInputElement).value;
    searchTerm = searchTerm.toLowerCase();
    const filtered = this.expenses().filter((product) => {
      return product.title.toLowerCase().includes(searchTerm);
    });
    this.expenses.set(filtered);
  }
}
