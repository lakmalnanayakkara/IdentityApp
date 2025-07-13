using AutoMapper;
using backend.Data;
using backend.DTOs.Admin;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace backend.Services.IMPL
{
    public class EmployeeServiceIMPL : EmployeeService
    {
        private readonly Context _dbContext;
        private readonly IMapper _mapper;
        public EmployeeServiceIMPL(Context dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public EmployeeDTO addEmployee(EmployeeAddDTO employeeAddDTO)
        {
            var employee = _dbContext.Employees.FirstOrDefault(e => e.Email == employeeAddDTO.Email);

            if (employee != null)
            {
                throw new Exception("Employee with this email already exists.");
            }

            var newEmployee = _mapper.Map<Employee>(employeeAddDTO);

            _dbContext.Employees.Add(newEmployee);
            _dbContext.SaveChanges();

            return _mapper.Map<EmployeeDTO>(newEmployee);
        }

        public EmployeeDTO deleteEmployee(int id)
        {
            Employee employee = _dbContext.Employees.Find(id);
            if (employee != null)
            {
                _dbContext.Employees.Remove(employee);
                _dbContext.SaveChanges();
                return _mapper.Map<EmployeeDTO>(employee);
            }
            else
            {
                throw new Exception("Employee doesn't exist");
            }
        }

        public EmployeePaginatedDTO getAllEmployees(int page, int pageSize)
        {
            int total = _dbContext.Employees.Count();
            List<Employee> employees = _dbContext.Employees
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .ToList();
            List<EmployeeDTO> result = new List<EmployeeDTO>();
            foreach (Employee employee in employees)
            {
                result.Add(_mapper.Map<EmployeeDTO>(employee));
            }
            EmployeePaginatedDTO employeePaginatedDTO = new EmployeePaginatedDTO();
            employeePaginatedDTO.employeeDTOs = result;
            employeePaginatedDTO.count = total;
            return employeePaginatedDTO;
        }

        public EmployeeDTO getEmployeeById(int id)
        {
            Employee employee = _dbContext.Employees.Find(id);
            if (employee != null)
            {
                return _mapper.Map<EmployeeDTO>(employee);
            }
            else
            {
                throw new Exception("Employee doesn't exist");
            }
        }

        public EmployeeDTO updateEmployee(EmployeeDTO employeeDTO)
        {
            Employee employee = _dbContext.Employees.Find(employeeDTO.Id);
            if (employee != null)
            {
                _mapper.Map(employeeDTO,employee);
                _dbContext.Update(employee);
                _dbContext.SaveChanges();
                return _mapper.Map<EmployeeDTO>(employee);
            }
            else
            {
                throw new Exception("Employee doesn't exist");
            }

        }
    }
}
