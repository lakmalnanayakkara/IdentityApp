using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/play")]
    [ApiController]
    public class PlayController : ControllerBase
    {
        [HttpGet("get-players")]
        public IActionResult Players()
        {
            return Ok(new JsonResult(new {message = "Only authorize users can view players"}));
        }

    }
}
