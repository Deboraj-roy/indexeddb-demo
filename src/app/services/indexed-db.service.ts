import { Injectable } from '@angular/core';
import { Employee } from '../models/employee';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {

  private dbName = 'PrototypeDB';
  private dbVersion = 1;

  // private db!: IDBDatabase;
  private db!: IDBDatabase;
  private dbReady!: Promise<IDBDatabase>;

  constructor() {
    this.openDatabase();
  }

  private openDatabase(): void {

    const request = indexedDB.open(this.dbName, this.dbVersion);

    request.onupgradeneeded = (event: any) => {

      const db = event.target.result;

      if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', {
          keyPath: 'id',
          autoIncrement: true
        });
      }

      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result;
      console.log('IndexedDB connected');
    };

    request.onerror = (event: any) => {
      console.error('IndexedDB error:', event.target.error);
    };
  }

  // -------------------------
  // Employee CRUD
  // -------------------------

  addEmployee(employee: Employee): void {

    const transaction = this.db.transaction(
      'employees',
      'readwrite'
    );

    const store = transaction.objectStore('employees');

    store.add(employee);
  }

  getEmployees(): Promise<Employee[]> {

    return new Promise((resolve, reject) => {

      const transaction = this.db.transaction(
        'employees',
        'readonly'
      );

      const store = transaction.objectStore('employees');

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  updateEmployee(employee: Employee): void {

    const transaction = this.db.transaction(
      'employees',
      'readwrite'
    );

    transaction.objectStore('employees').put(employee);
  }

  deleteEmployee(id: number): void {

    const transaction = this.db.transaction(
      'employees',
      'readwrite'
    );

    transaction.objectStore('employees').delete(id);
  }

  // -------------------------
  // Product CRUD
  // -------------------------

  addProduct(product: Product): void {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').add(product);
  }

  getProducts(): Promise<Product[]> {

    return new Promise((resolve, reject) => {

      const transaction = this.db.transaction(
        'products',
        'readonly'
      );

      const store = transaction.objectStore('products');

      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  updateProduct(product: Product): void {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').put(product);
  }

  deleteProduct(id: number): void {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').delete(id);
  }
}