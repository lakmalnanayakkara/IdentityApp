using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace backend.Controllers
{
    public class FallbackController : Controller
    {
        public IActionResult Index()
        {
            return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/browser", "index.html"), "text/HTML");
        }
    }
}
