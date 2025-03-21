import { Injectable } from '@angular/core';
import { Expense } from '../models/expense';
import { Observable, from } from 'rxjs';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor(private firestore: Firestore) {}

  addExpense(expense: Expense) {
    const expensesRef = collection(this.firestore, 'expenses');
    return addDoc(expensesRef, expense);
  }

  getAll(): Observable<Expense[]> {
    const expensesRef = collection(this.firestore, 'expenses'); // Reference to Firestore collection
    return collectionData(expensesRef, { idField: 'id' }) as Observable<
      Expense[]
    >;
  }

  getExpense(id: string): Observable<Expense> {
    const expensesDocRef = doc(this.firestore, `expenses/${id}`); // Reference to Firestore collection
    return from(getDoc(expensesDocRef).then((doc) => doc.data() as Expense));
  }

  deleteExpense(id: string): Promise<void> {
    const expenseDocRef = doc(this.firestore, `expenses/${id}`);
    return deleteDoc(expenseDocRef);
  }

  async updateExpense(expense: Expense, id: string) {
    const expenseRef = doc(this.firestore, 'expenses', id);
    await updateDoc(expenseRef, { ...expense });
  }
}
