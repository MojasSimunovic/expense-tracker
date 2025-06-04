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
import { DatePipe, NgClass } from '@angular/common';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { end, start } from '@popperjs/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [ NgbDatepickerModule, FormsModule, CommonModule, MatTableModule, FormsModule, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit {
	calendar = inject(NgbCalendar);
	formatter = inject(NgbDateParserFormatter);

  themeService = inject(AuthService);
  currentDate = new Date();
  currentYear = this.currentDate.getFullYear();
  currentMonth = this.currentDate.getMonth(); 
	hoveredDate: NgbDate | null = null;
  fromDate: NgbDate | null = new NgbDate(this.currentYear, this.currentMonth + 1, 1);
  toDate: NgbDate | null = new NgbDate(this.currentYear, this.currentMonth + 1, new Date(this.currentYear, this.currentMonth + 1, 0).getDate());
  datePipe = inject(DatePipe);
  expenses = signal<Expense[]>([]);
  category = signal<string>('All');
  searchInput = signal<string>('');
  changedDate = signal<Boolean>(false);
  sortedByDate = signal<boolean>(true);
  itemsToShow = signal<number>(5); 
  isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  filteredExpenses = computed(() => {
    const category = this.category();
    const searchInput = this.searchInput();
    this.changedDate();
    // Filter by category and month
    this.sortedByDate();
    if (this.sortedByDate()) {
      return this.expenses().filter((expense) => {
        const expenseDate = new Date(expense.date); 
        // check for the search input text
        const isSearched = 
          expense.title.toLowerCase().includes(searchInput);
        // Check if both category and month match
        const isCategoryMatch =
          category === 'All' || expense.category === category;
  
        const isDateInRange = 
            this.fromDate && this.toDate 
              ? expenseDate >= new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day) &&
                expenseDate <= new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day + 1)
              : false;
  
        return isCategoryMatch && isDateInRange && isSearched;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else {
      return this.expenses().filter((expense) => {
        const expenseDate = new Date(expense.date); 
        // check for the search input text
        const isSearched = 
          expense.title.toLowerCase().includes(searchInput);
        // Check if both category and month match
        const isCategoryMatch =
          category === 'All' || expense.category === category;
  
        const isDateInRange = 
            this.fromDate && this.toDate 
              ? expenseDate >= new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day) &&
                expenseDate <= new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day + 1)
              : false;
  
        return isCategoryMatch && isDateInRange && isSearched;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  displayedExpenses = computed(() => {
    return this.filteredExpenses().slice(0, this.itemsToShow());
  });

  filteredUnnecessaryExpenses = computed(() => {
    return this.filteredExpenses().reduce((acc, expense) => {
      if (expense.excess) {
        return acc + expense.price;
      }
      return acc;
    }, 0);
  });

  totalAmount = computed(() =>
    this.filteredExpenses().reduce((sum, item) => sum + item.price, 0)
  );

  constructor(private expenseService: ExpenseService, private router: Router) {}

  ngOnInit(): void {
    this.expenseService.getAll().subscribe((data) => {
      this.expenses.set(data);
    });
  }

  setFilter(e: any) {
    this.category.set(e.value);
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

  assignExcessStyle(excess: boolean) {
    if (excess === true) {
      return {'--bs-table-bg': '#ff6d6d'};
    } else {
      return;
    }
  }

	onDateSelection(date: NgbDate) {
		if (!this.fromDate && !this.toDate) {
			this.fromDate = date;
		} else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
			this.toDate = date;
		} else {
			this.toDate = null;
			this.fromDate = date;
		}
    this.changedDate.set(!this.changedDate());
	}

	isHovered(date: NgbDate) {
		return (
			this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
		);
	}

	isInside(date: NgbDate) {
		return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
	}

	isRange(date: NgbDate) {
		return (
			date.equals(this.fromDate) ||
			(this.toDate && date.equals(this.toDate)) ||
			this.isInside(date) ||
			this.isHovered(date)
		);
	}

	validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
		const parsed = this.formatter.parse(input);
		return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
	}

  loadMore() {
    this.itemsToShow.update(value => value + 5); // Load 5 more on each click
  }
}
