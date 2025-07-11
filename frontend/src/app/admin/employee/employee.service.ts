import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EmployeeView } from '../../interface/employee';
import { MemberAddEdit } from '../../interface/member';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  getEmployees(page: number, pageSize: number) {
    return this.http.get(
      `${environment.appUrl}employee/get-all-employees/${page}/${pageSize}`
    );
  }

  getEmployee(id: number) {
    return this.http.get(
      `${environment.appUrl}employee/get-employee-by-id/${id}`
    );
  }

  deleteMember(id: number) {
    return this.http.delete(
      `${environment.appUrl}employee/delete-employee/${id}`,
      {}
    );
  }

  addEmployee(model: MemberAddEdit) {
    return this.http.post(`${environment.appUrl}employee/add-employee`, model);
  }

  editEmployee(model: EmployeeView) {
    return this.http.put(
      `${environment.appUrl}employee/update-employee`,
      model
    );
  }
}
