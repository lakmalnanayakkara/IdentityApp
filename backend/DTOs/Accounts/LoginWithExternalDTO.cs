using System.ComponentModel.DataAnnotations;

namespace backend.DTOs.Accounts
{
    public class LoginWithExternalDTO
    {
        [Required]
        public string AccessToken { get; set; }
        [Required]
        public string UserId { get; set; }

        [Required]
        public string Provider { get; set; }
    }
}
