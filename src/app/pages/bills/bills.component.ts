import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Bill } from '../../models/bill';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { filter } from 'zrender/lib/core/util';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bills',
  imports: [CommonModule, MatIcon, FormsModule,NgClass],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent implements OnInit {
  bills = signal<Bill[]>([]);
  themeService = inject(AuthService);
  billsService = inject(ExpenseService);
  searchValue = signal<string>('');
  isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });

  ngOnInit(): void {
    this.billsService.getAllBills().subscribe((data) => {
      this.bills.set(data);
    });
  }

  filteredBills = computed(() => {
    const searchInput = this.searchValue().toLowerCase();
    return this.bills().filter((bill) => 
      bill.vendor.toLowerCase().includes(searchInput)
    );
  });

  convertTimestampToDate(timestamp: any): Date {
    return timestamp?.toDate ? timestamp.toDate() : new Date();
  }

  onRemoveBill(id: string) {
    this.billsService.removeBill(id);
  }
}
