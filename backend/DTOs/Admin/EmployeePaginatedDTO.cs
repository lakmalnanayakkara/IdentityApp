using System.Collections.Generic;

namespace backend.DTOs.Admin
{
    public class EmployeePaginatedDTO
    {
        public List<EmployeeDTO> employeeDTOs { get; set; }
        public int count { get; set; }
    }
}
