import Dexie, { type Table } from 'dexie';
import { Invoice } from '../types/invoice';

export class BillWebzDatabase extends Dexie {
  invoices!: Table<Invoice>;

  constructor() {
    super('BillWebzDatabase');
    this.version(1).stores({
      invoices: 'id, type, status, theme, createdAt, updatedAt, [type+status], [type+createdAt], [type+invoiceNumber]'
    });
  }
}

export const db = new BillWebzDatabase();
export default db;
