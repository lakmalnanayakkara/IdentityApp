using AutoMapper;
using backend.DTOs.Admin;
using backend.Models;

namespace backend.Mappers
{
    public class EmployeeMapper:Profile
    {
        public EmployeeMapper()
        {
            CreateMap<EmployeeAddDTO, Employee>();
            CreateMap<Employee, EmployeeDTO>();
            CreateMap<EmployeeDTO, Employee>();
        }
    }
}
﻿

