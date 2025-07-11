using backend.DTOs.Admin;
using System.Collections.Generic;

namespace backend.Services
{
    public interface EmployeeService
    {
        EmployeeDTO addEmployee(EmployeeAddDTO employeeAddDTO);
        EmployeeDTO deleteEmployee(int id);
        EmployeePaginatedDTO getAllEmployees(int page, int pageSize);
        EmployeeDTO getEmployeeById(int id);
        EmployeeDTO updateEmployee(EmployeeDTO employeeDTO);
    }
}
