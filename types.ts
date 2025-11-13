import { type Timestamp } from 'firebase/firestore';

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface BillItem {
  product: Product;
  quantity: number;
}

export interface InvoiceData {
  id?: string; // Document ID from Firestore
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  userId: string;
  createdAt?: Timestamp;
}