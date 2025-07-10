using backend.DTOs.Accounts;
using backend.Models;
using backend.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("api/account")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;
        private readonly HttpClient _fbHttpClient;

        public AccountController(JWTService jwtService, SignInManager<User> signInManager, UserManager<User> userManager, EmailService emailService, IConfiguration config)
        {
            _jwtService = jwtService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
            _fbHttpClient = new HttpClient { 
                BaseAddress = new Uri("https://graph.facebook.com")
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByNameAsync(loginDTO.Username);
            if (user == null) return Unauthorized("Invalid Username or Password");
            if (user.EmailConfirmed == false) return Unauthorized("Please Confirm your email.");
            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDTO.Password, false);
            if (result.IsLockedOut)
            {
                return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login", user.LockoutEnd));
            }
            if (!result.Succeeded)
            {
                // User has input an invalid password
                if (!user.UserName.Equals(SD.AdminUserName))
                {
                    // Increamenting AccessFailedCount of the AspNetUser by 1
                    await _userManager.AccessFailedAsync(user);
                }

                if (user.AccessFailedCount >= SD.MaximumLoginAttempts)
                {
                    // Lock the user for one day
                    await _userManager.SetLockoutEndDateAsync(user, DateTime.UtcNow.AddDays(1));
                    return Unauthorized(string.Format("Your account has been locked. You should wait until {0} (UTC time) to be able to login", user.LockoutEnd));
                }


                return Unauthorized("Invalid username or password");
            }


            return await CreateApplicationUserDto(user);
        }

        [HttpPost("login-with-third-party")]
        public async Task<ActionResult<UserDTO>> LoginWithThirdParty(LoginWithExternalDTO loginWithExternalDTO)
        {
            if (loginWithExternalDTO.Provider.Equals(SD.Facebook))
            {
                try
                {
                    if (!FacebookValidatedAsync(loginWithExternalDTO.AccessToken, loginWithExternalDTO.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to login with facebook");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to login with facebook");
                }
            }
            else if (loginWithExternalDTO.Provider.Equals(SD.Google))
            {
                try
                {
                    if (!GoogleValidatedAsync(loginWithExternalDTO.AccessToken, loginWithExternalDTO.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to login with google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to login with google");
                }
            }
            else
            {
                return BadRequest("Invalid Provider");
            }

            var user = await _userManager.Users.FirstOrDefaultAsync(x=>x.UserName == loginWithExternalDTO.UserId && x.Provider == loginWithExternalDTO.Provider);
            if (user == null) return BadRequest(string.Format("Unable to find your account."));

            return await CreateApplicationUserDto(user);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO registerDTO) 
        { 
            if(await CheckEamilExists(registerDTO.Email))
            {
                return BadRequest("Email already exists.");
            }

            var userToAdd = new User
            {
                FirstName = registerDTO.FirstName.ToLower(),
                LastName = registerDTO.LastName.ToLower(),
                UserName = registerDTO.Email.ToLower(),
                Email = registerDTO.Email.ToLower(),
               
            };

            var result = await _userManager.CreateAsync(userToAdd, registerDTO.Password);
            if (!result.Succeeded) return Unauthorized("Invalid Username or Password");

            try
            {
                if(await SendConfirmEmailAsync(userToAdd))
                {
                    return Ok(new JsonResult(new { title = "Account Created", message = "Your Account has been created, please confirm your email address" }));
                }
                return BadRequest("Failed to send email. Please contact admin.");
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email. Please contact admin.");
            }
            
        }

        [HttpPost("register-with-third-party")]
        public async Task<ActionResult<UserDTO>> RegisterWithThirdParty(RegisterWithExternal model)
        {
            if (model.Provider.Equals(SD.Facebook))
            {
                try
                {
                    if (!FacebookValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to register with facebook");
                    }
                }
                catch(Exception ex)
                {
                    return Unauthorized("Unable to register with facebook");
                }
            }
            else if (model.Provider.Equals(SD.Google))
            {
                try
                {
                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to register with google");
                    }
                }
                catch (Exception ex)
                {
                    return Unauthorized("Unable to register with google");
                }
            }
            else
            {
                return BadRequest("Invalid Provider");
            }

            var user = await _userManager.FindByNameAsync(model.UserId);
            if (user != null) return BadRequest(string.Format("You have an account already. Please login with your {0}", model.Provider));

            var userToAdd = new User
            {
                FirstName = model.FirstName.ToLower(),
                LastName = model.LastName.ToLower(),
                UserName = model.UserId.ToLower(),
                Provider = model.Provider,

            };

            var result = await _userManager.CreateAsync(userToAdd);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return await CreateApplicationUserDto(userToAdd);
        }

        [Authorize]
        [HttpGet("refresh-token")] 
        public async Task<ActionResult<UserDTO>> RefreshToken()
        {
            var user = await _userManager.FindByIdAsync(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return await CreateApplicationUserDto(user);
        }

        [HttpPut("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDTO confirmEmailDTO)
        {
            var user = await _userManager.FindByEmailAsync(confirmEmailDTO.Email);
            if (user == null)
            {
                return Unauthorized("This email has not been registered.");
            }

            if (user.EmailConfirmed == true) return BadRequest("Your email was confirmed before. Please log into your account.");

            try
            {
                var decodeTokenBytes = WebEncoders.Base64UrlDecode(confirmEmailDTO.Token);
                var decodeToken = Encoding.UTF8.GetString(decodeTokenBytes);

                var result = await _userManager.ConfirmEmailAsync(user, decodeToken);
                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Confirmed", message ="Your email address is confirmed. Yes can login now." }));
                }
                return BadRequest("Invalid Email. Please try again");
            }
            catch (Exception) 
            {
                return BadRequest("Invalid Email. Please try again");
            }
        }

        [HttpPost("resend-email-confirmation-link/{email}")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid Email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return BadRequest("This email has not been registered.");
            if (user.EmailConfirmed == true) return BadRequest("Your email address confirmed before. Please login to your account.");

            try
            {
                if(await SendConfirmEmailAsync(user))
                {
                    return Ok(new JsonResult(new { title = "Confiramation link sent", message = "Please confirm your email address." }));
                }
                return BadRequest("Failed to send email.Please contact admin.");
            }
            catch (Exception) { return BadRequest(); }
        }

        [HttpPost("forgot-username-or-password/{email}")]
        public async Task<IActionResult> ForgotUsernameOrPassword(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid Email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return BadRequest("This email has not been registered.");
            if (user.EmailConfirmed == false) return BadRequest("Your email address confirmed before. Please login to your account.");

            try
            {
                if(await SendForgotUsernameOrPasswordEmail(user))
                {
                    return Ok(new JsonResult(new { title = "Forgot username or password email sent", message = "Please check your email" }));
                }
                return BadRequest("Failed to send email.Please contact admin.");
            }
            catch (Exception) { return BadRequest("Failed to send email.Please contact admin."); }
        }

        [HttpPut("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDTO resetPasswordDTO)
        {
            var user = await _userManager.FindByEmailAsync(resetPasswordDTO.Email);
            if (user == null)
            {
                return Unauthorized("This email has not been registered.");
            }

            if (user.EmailConfirmed == false) return BadRequest("Your email was confirmed before. Please log into your account.");

            try
            {
                var decodeTokenBytes = WebEncoders.Base64UrlDecode(resetPasswordDTO.Token);
                var decodeToken = Encoding.UTF8.GetString(decodeTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodeToken,resetPasswordDTO.NewPassword);
                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Password Reset Success", message = "Your password has been reset" }));
                }
                return BadRequest("Invalid Email. Please try again");
            }
            catch (Exception)
            {
                return BadRequest("Invalid Email. Please try again");
            }
        }
        #region Private Helper Methods
        private async Task<UserDTO> CreateApplicationUserDto(User user)
        {
            return new UserDTO
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                JWT = await _jwtService.CrweateJwtToken(user)
            };
        }

        private async Task<bool> CheckEamilExists(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email);
        }

        private async Task<bool> SendConfirmEmailAsync(User user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["Jwt:ClientUrl"]}/{_config["Email:ConfirmationEmailPath"]}?token={token}&email={user.Email}";

            var body = $"<p>Hello: {user.FirstName} {user.LastName}</p>" +
                "<p>Please confirm your email address by clicking onyhe following link.</p>" +
                $"<p><a href=\"{url}\">Click here</a></p>" +
                "<p>Thak you<p/>" +
                $"<br>{_config["Email:ApplicationName"]}";

            var emailSend = new EmailSendDTO(user.Email, "Confirm your email", body);

            return await _emailService.sendEmailAsync(emailSend);
        }

        private async Task<bool> SendForgotUsernameOrPasswordEmail(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["Jwt:ClientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";

            var body = $"<p>Hello: {user.FirstName} {user.LastName}</p>" +
                $"<p>Username:{user.UserName}</p>" +
                "<p>In order to reset your password, please click on the following link.</p>"+
                $"<p><a href=\"{url}\">Click here</a></p>" +
                "<p>Thak you<p/>" +
                $"<br>{_config["Email:ApplicationName"]}";

            var emailSend = new EmailSendDTO(user.Email, "Forgot Username or Password", body);

            return await _emailService.sendEmailAsync(emailSend);

        }

        private async Task<bool> FacebookValidatedAsync(string accessToken,string userId)
        {
            var facebookKeys = _config["Facebook:AppId"] + "|" + _config["Facebook:AppSecret"];
            var fbResult = await _fbHttpClient.GetFromJsonAsync<FacebookResultDTO>($"debug_token?input_token={accessToken}&access_token={facebookKeys}");
            if(fbResult == null || fbResult.Data.Is_Valid == false || !fbResult.Data.User_Id.Equals(userId))
            {
                return false;
            }
            return true;
        }

        private async Task<bool> GoogleValidatedAsync(string accessToken, string userId)
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken);

            if (!payload.Audience.Equals(_config["Google:ClientId"]))
            {
                return false;
            }
            
            if (payload.Issuer.Equals("accounts.google.com") && !payload.Issuer.Equals("https://accounts.google.com"))
            {
                return false;
            }

            if(payload.ExpirationTimeSeconds == null)
            {
                return false;
            }

            DateTime now = DateTime.Now.ToUniversalTime();
            DateTime expiration = DateTimeOffset.FromUnixTimeSeconds((long)payload.ExpirationTimeSeconds).DateTime;
            if (expiration < now)
            {
                return false;
            }

            if (!payload.Subject.Equals(userId))
            {
                return false;
            }

            return true;
        }
        #endregion
    }
}
