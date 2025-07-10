using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class RegisterWithExternal
    {
        [Required]
        [StringLength(15, MinimumLength = 2, ErrorMessage = "First Name must be minimum 2 characters and maximum 15")]
        public string FirstName { get; set; }
        [Required]
        [StringLength(15, MinimumLength = 2, ErrorMessage = "Last Name must be minimum 2 characters and maximum 15")]
        public string LastName { get; set; }
        [Required]
        public string AccessToken { get; set; }
        [Required]
        public string UserId { get; set; }

        [Required]
        public string Provider { get; set; }
    }
}
