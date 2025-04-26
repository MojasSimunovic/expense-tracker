import { Component, ElementRef, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Expense } from '../../models/expense';
import { Bill } from '../../models/bill';
import { DatePipe } from '@angular/common';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { ToastsContainer } from '../../components/toasts-container/toasts-container.component'
import { BarcodeFormat } from '@zxing/browser';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-qr-scanner',
  imports: [ZXingScannerModule, NgbToastModule, ToastsContainer,FormsModule, NgIf],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.css',
  providers: [DatePipe]
})
export class QrScannerComponent {
  @ViewChild('successTpl') successTpl!: TemplateRef<any>;
  success: boolean = true;
  isLoader: boolean = false;

  datePipe = inject(DatePipe);
  http = inject(HttpClient);
  router = inject(Router);
  invoiceService = inject(ExpenseService);
  invoiceData: any[] = [];

  url?: string;

  today: any = new Date().toISOString().split('T')[0];

  toastService = inject(ToastService);

  textBetween = signal('');

  scannedResult: string | null = null;

  hasDevices: boolean = false;
  availableDevices: MediaDeviceInfo[] = [];
  selectedDevice: MediaDeviceInfo | undefined;
  sTpl!: TemplateRef<any>;
  formats: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.hasDevices = true;
    this.availableDevices = devices;
    const rearCamera = devices.find(device => device.label.toLowerCase().includes('back'));
    if (rearCamera) {
      this.selectedDevice = rearCamera;
    } else {
      this.selectedDevice = devices[0];
    }
  }

  onScanSuccess(result: string): void {
    if (result) {
      this.scannedResult = result;
      this.onScanSuccessCallback(result); // Reusing your previous logic
      setTimeout(() => {
        this.router.navigateByUrl('dashboard');
      }, 100);
    }
  }

  onScanSuccessCallback(url: string): void {
    const parser = new DOMParser();
    this.invoiceService.getInvoiceData(url).subscribe(
      (data) => {
        const panelBodyData = parser.parseFromString(data, 'text/html');
        const preTagContent = panelBodyData.querySelector('pre');
        if (preTagContent) {
          const extractedItems = this.extractTextBetweenHeadings(preTagContent.innerHTML);
          if (extractedItems) {
            this.processExtractedText(extractedItems, new Date());
          }
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

  async onSubmit(formValue: { url: string }) {
    const url = formValue.url;
    this.onScanSuccess(url);
    this.url = '';
    navigator.vibrate?.(50);
    this.showSuccess(this.successTpl);
  }

  async processUrl(url: string) {
    const parser = new DOMParser();
    this.invoiceService.getInvoiceData(url).subscribe(
      (data) => {
        const panelBodyData = parser.parseFromString(data, 'text/html');
        const preTagContent = panelBodyData.querySelector('pre');
        if (preTagContent) {
          const extractedItems = this.extractTextBetweenHeadings(preTagContent.innerHTML);
          if (extractedItems) {
            this.processExtractedText(extractedItems, new Date());
          }
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

  extractTextBetweenHeadings(text: string): string[][] | null {
    let date = new Date();
    const match = text.match(/ПФР време:\s+(\d{2}\.\d{2}\.\d{4})/);
    date = match && match[1] ? new Date(match[1].split('.').reverse().join('-')) : new Date();

    const lines = text.split('\n').map(line => line.trim());
    const startIdx = lines.findIndex(line => line.includes("Назив   Цена         Кол.         Укупно"));
    const endIdx = lines.findIndex(line => line.startsWith("----------------------------------------"));

    if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
      console.error("Could not find the expected section.");
      return null;
    }

    const rawItems = lines.slice(startIdx + 1, endIdx);
    const mergedItems: string[][] = [];
    let currentItem: string[] = [];

    for (const line of rawItems) {
      if (/^\d{1,3},\d{2}/.test(line)) { 
        // Nova stavka (počinje sa cenom)
        currentItem.push(line);
        mergedItems.push([...currentItem]); 
        currentItem = []; 
      } else {
        // Deo naziva proizvoda
        currentItem.push(line);
      }
    }

    return mergedItems;
}

  processExtractedText(extractedItems: string[][], date: Date): any[] {
  const items: Expense[] = [];

  for (const itemParts of extractedItems) {
      if (itemParts.length < 2) continue; // Ensure we have enough data

      const itemName = itemParts.slice(0, -1).join(' '); // Everything except last part is name
      const itemDetails = itemParts[itemParts.length - 1].split(/\s+/); // Last line is price, quantity, total

      if (itemDetails.length === 3) {
          const [price, quantity, totalPrice] = itemDetails;
          const priceFormatted = parseFloat(price.replace(',', '.')); // Convert "84,99" to 84.99

          items.push({
              title: itemName,
              date: new Date(this.datePipe.transform(date, 'yyyy-MM-dd') || '').toISOString().split('T')[0],
              category: 'Unknown',
              price: priceFormatted, // Corrected price
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
    navigator.vibrate(50);
    this.showSuccess(this.successTpl);
    setTimeout(() => {
      this.router.navigateByUrl('dashboard');
    }, 100);

    return items;
  }
  showSuccess(template: TemplateRef<any>) {
    this.toastService.show({ template, classname: 'bg-success text-light', delay: 100 });
  }
}
