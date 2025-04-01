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
  where,
  query,
} from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Bill } from '../models/bill';
import { getAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {

  private userId: string;
  http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/scrape';
  constructor(private firestore: Firestore) {
    const auth = getAuth();
    this.userId = auth.currentUser?.uid || '';
  }

  // Add an expense with the userId
  addExpense(expense: Expense) {
    if (!this.userId) throw new Error('No user logged in');
    const expensesRef = collection(this.firestore, 'expenses');
    return addDoc(expensesRef, { ...expense, userId: this.userId });
  }

  // Get all expenses for the logged-in user
  getAll(): Observable<Expense[]> {
    if (!this.userId) throw new Error('No user logged in');
    const expensesRef = collection(this.firestore, 'expenses');
    const expensesQuery = query(expensesRef, where('userId', '==', this.userId)); // Filter by userId
    return collectionData(expensesQuery, { idField: 'id' }) as Observable<Expense[]>;
  }

  // Get a specific expense by ID
  getExpense(id: string): Observable<Expense> {
    if (!this.userId) throw new Error('No user logged in');
    const expensesDocRef = doc(this.firestore, `expenses/${id}`);
    return from(getDoc(expensesDocRef).then((doc) => doc.data() as Expense));
  }

  // Delete an expense
  deleteExpense(id: string): Promise<void> {
    if (!this.userId) throw new Error('No user logged in');
    const expenseDocRef = doc(this.firestore, `expenses/${id}`);
    return deleteDoc(expenseDocRef);
  }

  // Update an expense
  async updateExpense(expense: Expense, id: string) {
    if (!this.userId) throw new Error('No user logged in');
    const expenseRef = doc(this.firestore, 'expenses', id);
    await updateDoc(expenseRef, { ...expense });
  }
  getInvoiceData(url: string): Observable<any> {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');
    
      return this.http.get<any>(`http://localhost:3000/proxy?url=${encodeURIComponent(url)}`, { headers });
  }

  // Bills

  // Add a bill with the userId
  addBill(bill: Bill) {
    if (!this.userId) throw new Error('No user logged in');
    const billsRef = collection(this.firestore, 'bills');
    return addDoc(billsRef, { ...bill, userId: this.userId });
  }

  // Remove a bill
  removeBill(id: string) {
    if (!this.userId) throw new Error('No user logged in');
    const billsRef = doc(this.firestore, `bills/${id}`);
    return deleteDoc(billsRef);
  }

  // Get all bills for the logged-in user
  getAllBills(): Observable<Bill[]> {
    if (!this.userId) throw new Error('No user logged in');
    const billsRef = collection(this.firestore, 'bills');
    const billsQuery = query(billsRef, where('userId', '==', this.userId)); // Filter by userId
    return collectionData(billsQuery, { idField: 'id' }) as Observable<Bill[]>;
  }
}
