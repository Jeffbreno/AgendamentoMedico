using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConveniosController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // GET: /api/convenios
        [HttpGet]
        public async Task<IActionResult> GetConvenios()
        {
            var convenios = await _context.Convenios.ToListAsync();
            return Ok(convenios); // HTTP 200
        }

        // POST: /api/convenios
        [HttpPost]
        public async Task<IActionResult> PostConvenio([FromBody] Convenio convenio)
        {
            if (string.IsNullOrWhiteSpace(convenio.Nome))
                return BadRequest("O nome do convênio é obrigatório.");

            _context.Convenios.Add(convenio);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetConvenios), new { id = convenio.Id }, convenio); // HTTP 201
        }
    }
}
