using backend.DTOs;
using backend.DTOs.Admin;
using backend.Models;
using backend.Services;
using Google.Apis.Util;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace backend.Controllers
{
    [Route("api/employee")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly EmployeeService _employeeService;
        
        public EmployeeController(EmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpPost("add-employee")]
        public IActionResult addEmployee([FromBody] EmployeeAddDTO employeeAddDTO)
        {
            EmployeeDTO addEmployeeDTO = _employeeService.addEmployee(employeeAddDTO);
            StandardResponse response = new StandardResponse(
                201,
                "ADDED SUCCESSFULLY",
                addEmployeeDTO
            );
            return Ok(response);
        }

        [HttpPut("update-employee")]
        public IActionResult updateEmployee([FromBody] EmployeeDTO employeeDTO)
        {
            EmployeeDTO editEmployeeDTO = _employeeService.updateEmployee(employeeDTO);
            StandardResponse response = new StandardResponse(
                200,
                "UPDATED SUCCESSFULLY",
                editEmployeeDTO);
            return Ok(response);
        }

        [HttpDelete("delete-employee/{id}")]
        public IActionResult deleteEmployee(int id)
        {
            EmployeeDTO deleteEmployeeDTO = _employeeService.deleteEmployee(id);
            StandardResponse response = new StandardResponse(
                200,
                "DELETED SUCCESSFULLY",
                deleteEmployeeDTO);
            return Ok(response);
        }

        [HttpGet("get-employee-by-id/{id}")]
        public IActionResult getEmployeeById(int id)
        {
            EmployeeDTO getEmployeeDTO = _employeeService.getEmployeeById(id);
            StandardResponse response = new StandardResponse(
                200,
                "RETRIEVED SUCCESSFULLY",
                getEmployeeDTO);
            return Ok(response);
        }


        [HttpGet("get-all-employees/{page}/{pageSize}")]
        public IActionResult getAllEmplyees(int page, int pageSize)
        {
            EmployeePaginatedDTO getAllEmployees = _employeeService.getAllEmployees(page, pageSize);
            StandardResponse response = new StandardResponse(
                200,
                "RETRIEVED SUCCESSFULLY",
                getAllEmployees);
            return Ok(response);
        }
    }
}
