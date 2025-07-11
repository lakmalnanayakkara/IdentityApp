import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../../util/shared.service';
import { EmployeeService } from '../employee.service';
import type { EmployeeView } from '../../../interface/employee';

@Component({
  selector: 'app-add-edit-employee',
  standalone: false,
  templateUrl: './add-edit-employee.component.html',
  styleUrl: './add-edit-employee.component.css',
})
export class AddEditEmployeeComponent {
  memberForm: FormGroup = new FormGroup({});
  formInitialized = false;
  addNew = true;
  submitted = false;
  errorMessages: string[] = [];
  empId: number;

  constructor(
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.addNew = false;
      this.empId = Number(id);
      this.getEmployee(Number(id));
    } else {
      this.initializeForm(undefined);
    }
  }

  getEmployee(id: number) {
    this.employeeService.getEmployee(id).subscribe({
      next: (response: any) => {
        this.initializeForm(response.data);
      },
    });
  }

  initializeForm(member: EmployeeView | undefined) {
    this.memberForm = this.formBuilder.group({
      id: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      position: ['', Validators.required],
      salary: ['', Validators.required],
    });

    if (member) {
      this.memberForm.patchValue({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        position: member.position,
        salary: member.salary,
      });
    }
    this.formInitialized = true;
  }

  submit(id: number) {
    this.submitted = true;
    this.errorMessages = [];
    if (this.memberForm.valid && id) {
      this.employeeService.editEmployee(this.memberForm.value).subscribe({
        next: (response: any) => {
          this.sharedService.showNotification(
            true,
            'Successful',
            'Employee Updated Successfully'
          );
          this.router.navigateByUrl('/admin/employee');
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        },
      });
    } else {
      this.employeeService.addEmployee(this.memberForm.value).subscribe({
        next: (response: any) => {
          this.sharedService.showNotification(
            true,
            'Successful',
            'Employee Added Successfully'
          );
          this.router.navigateByUrl('/admin/employee');
        },
        error: (error) => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        },
      });
    }
  }
}
