import { Component, computed, inject } from '@angular/core';
import { Expense } from '../../models/expense';
import { MatButtonModule } from '@angular/material/button';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  NgModel,
  Validators,
} from '@angular/forms';
import { OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ExpenseService } from '../../services/expense.service';
import { NgClass, NgIf } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-expense',
  imports: [ReactiveFormsModule, MatButtonModule, NgIf,NgClass],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.css',
  standalone: true,
})
export class AddExpenseComponent implements OnInit {
  today: string = new Date().toISOString().split('T')[0];
  expenseForm: FormGroup = new FormGroup({});
  themeService = inject(AuthService);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  expenseService = inject(ExpenseService);
  activatedRoute = inject(ActivatedRoute);
  isDarkMode = computed(() => {
    return this.themeService.isDarkMode();
  });
  constructor() {}
  ngOnInit(): void {
    this.expenseForm = this.formBuilder.group({
      title: ['', Validators.required],
      date: this.today,
      category: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['1', Validators.required],
    });
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.expenseService.getExpense(id).subscribe((expense) => {
        this.expenseForm.patchValue(expense);
      });
    } else {
    }
  }

  onSubmit() {
    let id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      if (this.expenseForm.valid) {
        let newExpense: Expense = this.expenseForm.value;
        this.expenseService.updateExpense(newExpense, id);
        this.router.navigate(['dashboard']);
      }
    } else {
      if (this.expenseForm.valid) {
        let newExpense: Expense = this.expenseForm.value;
        newExpense = { ...newExpense, id: crypto.randomUUID() };
        this.expenseService.addExpense(newExpense);
        this.router.navigate(['dashboard']);
      }
    }
  }
}
