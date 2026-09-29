import { Component, OnInit } from '@angular/core';
import { Employee } from './models/employee';
import { IndexedDbService } from './services/indexed-db.service';

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

  constructor(
    private db: IndexedDbService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
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

    await this.db.deleteEmployee(id);

    await this.loadEmployees();
  }

  clearEmployeeForm(): void {

    this.editingEmployeeId = undefined;

    this.employee = {
      name: '',
      email: '',
      department: ''
    };
  }
}
