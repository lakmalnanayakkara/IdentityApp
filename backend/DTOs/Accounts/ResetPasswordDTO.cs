using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class ResetPasswordDTO
    {
        [Required]
        public string Token { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Invalid Email")]
        public string Email { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 2, ErrorMessage = "Password be minimum 2 characters and maximum 15")]
        public string NewPassword { get; set; }
    }
}
