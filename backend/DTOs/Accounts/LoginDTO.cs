using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class LoginDTO
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
