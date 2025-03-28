import { Component, inject, OnInit, signal } from '@angular/core';
import { Bill } from '../../models/bill';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-bills',
  imports: [CommonModule, MatIcon],
  templateUrl: './bills.component.html',
  styleUrl: './bills.component.css'
})
export class BillsComponent implements OnInit {
  bills = signal<Bill[]>([]);

  billsService = inject(ExpenseService);
  ngOnInit(): void {
    this.billsService.getAllBills().subscribe((data) => {
      this.bills.set(data);
    });
  }

  convertTimestampToDate(timestamp: any): Date {
    return timestamp?.toDate ? timestamp.toDate() : new Date();
  }

  onRemoveBill(id: string) {
    this.billsService.removeBill(id);
  }

}
