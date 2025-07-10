using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class ConfirmEmailDTO
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid Email")]
        public string Email { get; set; }
    }
}
