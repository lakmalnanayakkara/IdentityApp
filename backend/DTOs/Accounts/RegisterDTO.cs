using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class RegisterDTO
    {
        [Required]
        [StringLength(15,MinimumLength =2,ErrorMessage ="First Name must be minimum 2 characters and maximum 15")]
        public string FirstName { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 2, ErrorMessage = "Last Name must be minimum 2 characters and maximum 15")]
        public string LastName { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", ErrorMessage ="Invalid Email")]
        public string Email { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 2, ErrorMessage = "Password be minimum 2 characters and maximum 15")]
        public string Password { get; set; }
    }
}
