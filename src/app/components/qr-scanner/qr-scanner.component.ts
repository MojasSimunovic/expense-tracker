import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Expense } from '../../models/expense';
import { Bill } from '../../models/bill';
import { DatePipe } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { ToastsContainer } from '../toasts-container/toasts-container.component';

@Component({
  selector: 'app-qr-scanner',
  imports: [ZXingScannerModule, NgbToastModule, ToastsContainer],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.css',
  providers: [DatePipe]
})
export class QrScannerComponent implements OnInit {
  @ViewChild('successTpl') successTpl!: TemplateRef<any>;
  success: boolean = true;
  isLoader: boolean = true;

  datePipe = inject(DatePipe);
  http = inject(HttpClient);
  router = inject(Router);
  invoiceService = inject(ExpenseService);
  selectedDevice?: MediaDeviceInfo;
  invoiceData: any[] = [];

  today: any = new Date().toISOString().split('T')[0];

  toastService = inject(ToastService);

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoader = false;
    }, 800);
  }

  onCamerasNotFound(devices: MediaDeviceInfo[]) {
    console.log(devices)
    if (devices.length > 0) {
      // this.isLoader = false; // Hide loader when cameras are found
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]) {
    if (devices.length > 0) {
   //   this.isLoader = false; // Hide loader when cameras are found
    }
  }

  onScanSuccess(url: string) {
    const parser = new DOMParser();
    this.invoiceService.getInvoiceData(url).subscribe(
      (data) => {
        const panelBodyData = parser.parseFromString(data, 'text/html');
        const preTagContent = panelBodyData.querySelector('pre');
        if (preTagContent) {
          this.extractTextBetweenHeadings(preTagContent.innerHTML);
          this.generateBill(preTagContent.innerHTML, url);
        } else {
          console.warn('preTagContent is null');
        }
      },
      (error) => {
        console.error('Error fetching journal:', error);
        if (error.error) {
          console.error('Error details:', error.error);
        }
      }
    );
  }

  generateBill(content: string, urlHref: string): any {
    let vendor: string = '';
    let date: Date = new Date();
    let url: string = urlHref;
    const id = crypto.randomUUID();
    let bill: Bill;
    const startHeading = '============ ФИСКАЛНИ РАЧУН ============';
    const endHeading = 'Касир';

    const match = content.match(/ПФР време:\s+(\d{2}\.\d{2}\.\d{4})/);
    date = match && match[1] ? new Date(match[1].split('.').reverse().join('-')) : new Date();
    // this.datePipe.transform(date, 'dd/MM/yyyy');
    const startIndexVendor = content.indexOf(startHeading);
    const endIndexVendor = content.indexOf(endHeading);
    if (startIndexVendor !== -1 && endIndexVendor !== -1) {
      const textBetween = content.substring(startIndexVendor + startHeading.length, endIndexVendor).trim();
      vendor = textBetween;
    }
    bill = {
      id: id,
      vendor: vendor.slice(10),
      date: date,
      url: url
    }
    this.invoiceService.addBill(bill);  
  }

  extractTextBetweenHeadings(content: string): string | null {
    const startHeading = 'Артикли';
    const endHeading = 'Укупан износ';

    const startIndex = content.indexOf(startHeading);
    const endIndex = content.indexOf(endHeading);

    if (startIndex !== -1 && endIndex !== -1) {
      const textBetween = content.substring(startIndex + startHeading.length, endIndex).trim();
      this.processExtractedText(textBetween);  // Pass extracted text to processExtractedText
    }

    // Return null if the headings are not found
    return null;
  }

  processExtractedText(text: string): any[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    // Remove the last line which is the separator
    lines.pop();
    const items: Expense[] = [];

    // Skip the first two lines (header and column titles) and start from the 3rd line
    for (let i = 2; i < lines.length; i += 2) {
      const itemName = lines[i].replace(/\s+/g, ' ').trim();
      const itemDetails = lines[i + 1].split(/\s+/); // Split by spaces to separate price, quantity, and total

      // Ensure itemDetails has all expected values
      if (itemDetails.length === 3) {
        const [price, quantity, totalPrice] = itemDetails;
        const priceWithoutDecimal = price.replace('.', '');

        items.push({
          title: itemName,
          date: this.today,
          category: 'Unknown',
          price: parseInt(priceWithoutDecimal),
          quantity: parseInt(quantity),
          id: crypto.randomUUID(),
          excess: false
        });
      }
      
    } 
    for (let expense of items) {
      this.invoiceService.addExpense(expense);
    }
    this.isLoader = true;
    this.showSuccess(this.successTpl);
    setTimeout(() => {
      this.router.navigateByUrl('dashboard');
    }, 900);
   

    return items;
  }
  showSuccess(template: TemplateRef<any>) {
    this.toastService.show({ template, classname: 'bg-success text-light', delay: 5000 });
  }
}
