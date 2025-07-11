import { Component, OnInit, TemplateRef } from '@angular/core';
import { EmployeeService } from './employee.service';
import { EmployeeView } from '../../interface/employee';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedService } from '../../util/shared.service';

@Component({
  selector: 'app-employee',
  standalone: false,
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent implements OnInit {
  page = 1;
  pageSize = 5;
  employeeList: EmployeeView[] = [];
  employeeToDelete: EmployeeView | undefined;
  modalRef?: BsModalRef;

  constructor(
    private employeeService: EmployeeService,
    private sharedService: SharedService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.employeeService.getEmployees(this.page, this.pageSize).subscribe({
      next: (response: any) => {
        this.employeeList = response.data.employeeDTOs;
      },
    });
  }

  deleteMember(id: number, template: TemplateRef<any>) {
    let member = this.employeeList.find((employee) => employee.id === id);

    if (member) {
      this.employeeToDelete = member;
      this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
    }
  }
  confirm() {
    if (this.employeeToDelete) {
      this.employeeService.deleteMember(this.employeeToDelete.id).subscribe({
        next: (_) => {
          this.sharedService.showNotification(
            true,
            'Deleted',
            `Member of ${this.employeeToDelete.firstName} has been deleted!`
          );
          this.employeeList = this.employeeList.filter(
            (x) => x.id !== this.employeeToDelete?.id
          );
          this.employeeToDelete = undefined;
          this.modalRef?.hide();
        },
      });
    }
  }

  decline() {
    this.employeeToDelete = undefined;
    this.modalRef?.hide();
  }
}
