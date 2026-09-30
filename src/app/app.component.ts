import { Component, OnInit } from '@angular/core';
import { Employee } from './models/employee';
import { MainIndexedDbService } from './services/main-indexed-db.service';
import { Product } from './models/product';
import { IndexedDBService } from './services/indexed-db.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent implements OnInit {

  employees: Employee[] = [];

  employee: Employee = {
    name: '',
    email: '',
    department: ''
  };

  editingEmployeeId?: number;
  //===============================================

  products: Product[] = [];

  product: Product = {
    name: '',
    price: 0,
    quantity: 0
  };

  editingProductId?: number;

  constructor(
    private db: MainIndexedDbService,
    private logService: IndexedDBService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();

    this.loadProducts();
  }

  async loadEmployees(): Promise<void> {
    this.employees = await this.db.getEmployees();
  }

  async saveEmployee(): Promise<void> {

    if (this.editingEmployeeId) {

      await this.db.updateEmployee({
        id: this.editingEmployeeId,
        ...this.employee
      });

    } else {

      await this.db.addEmployee(this.employee);
    }

    this.clearEmployeeForm();
    await this.loadEmployees();
  }

  editEmployee(employee: Employee): void {

    this.editingEmployeeId = employee.id;

    this.employee = {
      name: employee.name,
      email: employee.email,
      department: employee.department
    };
  }

  async deleteEmployee(id: number): Promise<void> {

    try {
      // An exception in an async method becomes a rejected Promise. Angular's
      // event handling may consume that rejection, so log it explicitly.
      await this.db.deleteEmployee(id);
      await this.loadEmployees();

      throw new Error('Test error for logging 999999');
    } catch (error) {
      this.logService.error(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  clearEmployeeForm(): void {

    this.editingEmployeeId = undefined;

    this.employee = {
      name: '',
      email: '',
      department: ''
    };
  }


  async loadProducts(): Promise<void> {
    this.products = await this.db.getProducts();
  }

  async saveProduct(): Promise<void> {

    if (this.editingProductId) {

      await this.db.updateProduct({
        id: this.editingProductId,
        ...this.product
      });

    } else {

      await this.db.addProduct(this.product);
    }

    this.clearProductForm();
    await this.loadProducts();
  }
  editProduct(product: Product): void {

    this.editingProductId = product.id;

    this.product = {
      name: product.name,
      price: product.price,
      quantity: product.quantity
    };
  }

  async deleteProduct(id: number): Promise<void> {

    await this.db.deleteProduct(id);

    await this.loadProducts();
  }

  clearProductForm(): void {

    this.editingProductId = undefined;

    this.product = {
      name: '',
      price: 0,
      quantity: 0
    };
  }


  async exportData(): Promise<void> {

    const data = await this.db.exportData();

    const json = JSON.stringify(data, null, 2);

    const blob = new Blob(
      [json],
      { type: 'application/json' }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `indexeddb-backup-${new Date().getTime()}.json`;

    link.click();

    window.URL.revokeObjectURL(url);
  }

  ///===============================================

  testLogging(): void {

    this.logService.error(
      'Test application error'
    );

    this.logService.warning(
      'Test application warning'
    );

    this.logService.info(
      'Test application information'
    );
  }

  exportLogs(): void {
    this.logService.exportLogs();
  }

}
