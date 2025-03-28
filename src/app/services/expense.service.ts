import { inject, Injectable } from '@angular/core';
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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Bill } from '../models/bill';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/scrape';
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
  getInvoiceData(url: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    
      return this.http.get<any>(`http://localhost:3000/proxy?url=${encodeURIComponent(url)}`, { headers });
  }

  addBill(bill: Bill) {
    const billsRef = collection(this.firestore, 'bills');
    return addDoc(billsRef, bill);
  }

  removeBill(id: string) {
    const billsRef = doc(this.firestore, `bills/${id}`);
    return deleteDoc(billsRef);
  }

  getAllBills(): Observable<Bill[]> {
    const billsRef = collection(this.firestore, 'bills'); // Reference to Firestore collection
    return collectionData(billsRef, { idField: 'id' }) as Observable<
      Bill[]
    >;
  }
}
