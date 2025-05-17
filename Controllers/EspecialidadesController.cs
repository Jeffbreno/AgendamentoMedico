using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EspecialidadesController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // GET: /api/especialidades
        [HttpGet]
        public async Task<IActionResult> GetEspecialidades()
        {
            var especialidades = await _context.Especialidades.ToListAsync();
            return Ok(especialidades); // HTTP 200
        }

        // POST: /api/especialidades
        [HttpPost]
        public async Task<IActionResult> PostEspecialidade([FromBody] Especialidade especialidade)
        {
            if (string.IsNullOrWhiteSpace(especialidade.Nome))
                return BadRequest("O nome da especialidade é obrigatório.");

            _context.Especialidades.Add(especialidade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEspecialidades), new { id = especialidade.Id }, especialidade); // HTTP 201
        }
    }
}
