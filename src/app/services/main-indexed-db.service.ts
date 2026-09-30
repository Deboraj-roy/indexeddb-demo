import { Injectable } from '@angular/core';
import { Employee } from '../models/employee';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class MainIndexedDbService {

  private dbName = 'PrototypeDB';
  private dbVersion = 1;

  // private db!: IDBDatabase;
  private db!: IDBDatabase;
  private dbReady!: Promise<IDBDatabase>;

  // constructor() {
  //   this.openDatabase();
  // }

  constructor() {
    this.dbReady = this.openDatabase();
  }

  // private openDatabase(): void {

  //   const request = indexedDB.open(this.dbName, this.dbVersion);

  //   request.onupgradeneeded = (event: any) => {

  //     const db = event.target.result;

  //     if (!db.objectStoreNames.contains('employees')) {
  //       db.createObjectStore('employees', {
  //         keyPath: 'id',
  //         autoIncrement: true
  //       });
  //     }

  //     if (!db.objectStoreNames.contains('products')) {
  //       db.createObjectStore('products', {
  //         keyPath: 'id',
  //         autoIncrement: true
  //       });
  //     }
  //   };

  //   request.onsuccess = (event: any) => {
  //     this.db = event.target.result;
  //     console.log('IndexedDB connected');
  //   };

  //   request.onerror = (event: any) => {
  //     console.error('IndexedDB error:', event.target.error);
  //   };
  // }

  // -------------------------
  // Employee CRUD
  // -------------------------

  private openDatabase(): Promise<IDBDatabase> {

    return new Promise((resolve, reject) => {

      const request = indexedDB.open(
        this.dbName,
        this.dbVersion
      );

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

        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // addEmployee(employee: Employee): void {

  //   const transaction = this.db.transaction(
  //     'employees',
  //     'readwrite'
  //   );

  //   const store = transaction.objectStore('employees');

  //   store.add(employee);
  // }

  async addEmployee(employee: Employee): Promise<void> {

    const db = await this.dbReady;

    const transaction = db.transaction(
      'employees',
      'readwrite'
    );

    transaction.objectStore('employees').add(employee);
  }

  // getEmployees(): Promise<Employee[]> {

  //   return new Promise((resolve, reject) => {

  //     const transaction = this.db.transaction(
  //       'employees',
  //       'readonly'
  //     );

  //     const store = transaction.objectStore('employees');

  //     const request = store.getAll();

  //     request.onsuccess = () => {
  //       resolve(request.result);
  //     };

  //     request.onerror = () => {
  //       reject(request.error);
  //     };
  //   });
  // }

  async getEmployees(): Promise<Employee[]> {

    const db = await this.dbReady;

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
        'employees',
        'readonly'
      );

      const request = transaction
        .objectStore('employees')
        .getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async updateEmployee(employee: Employee): Promise<void> {

    const transaction = this.db.transaction(
      'employees',
      'readwrite'
    );

    transaction.objectStore('employees').put(employee);
  }

  async deleteEmployee(id: number): Promise<void> {

    const transaction = this.db.transaction(
      'employees',
      'readwrite'
    );

    transaction.objectStore('employees').delete(id);
  }

  // -------------------------
  // Product CRUD
  // -------------------------

  async addProduct(product: Product): Promise<void> {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').add(product);
  }

  async getProducts(): Promise<Product[]> {

    const db = await this.dbReady;

    return new Promise((resolve, reject) => {

      const transaction = db.transaction(
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

  async updateProduct(product: Product): Promise<void> {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').put(product);
  }

  async deleteProduct(id: number): Promise<void> {

    const transaction = this.db.transaction(
      'products',
      'readwrite'
    );

    transaction.objectStore('products').delete(id);
  }
  async exportData(): Promise<any> {
    const employees = await this.getEmployees();
    const products = await this.getProducts();

    return {
      exportedAt: new Date().toISOString(),
      employees: employees,
      products: products
    };
  }
}