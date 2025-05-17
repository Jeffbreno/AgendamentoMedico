using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacientesController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // POST: /api/pacientes
        [HttpPost]
        public async Task<IActionResult> PostPaciente([FromBody] PacienteCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nome) || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Nome e e-mail são obrigatórios.");

            var convenio = await _context.Convenios.FindAsync(dto.ConvenioId);
            if (convenio == null)
                return BadRequest("Convênio não encontrado.");

            var paciente = new Paciente
            {
                Nome = dto.Nome,
                Email = dto.Email,
                Telefone = dto.Telefone,
                ConvenioId = dto.ConvenioId
            };

            _context.Pacientes.Add(paciente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPaciente), new { id = paciente.Id }, paciente);
        }

        // GET: /api/pacientes
        [HttpGet]
        public async Task<IActionResult> GetPacientes()
        {
            var pacientes = await _context.Pacientes
                .Include(p => p.Convenio)
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Email,
                    p.Telefone,
                    Convenio = new { p.Convenio.Id, p.Convenio.Nome }
                })
                .ToListAsync();

            return Ok(pacientes);
        }

        // GET: /api/pacientes/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaciente(int id)
        {
            var paciente = await _context.Pacientes
                .Include(p => p.Convenio)
                .Where(p => p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.Nome,
                    p.Email,
                    p.Telefone,
                    Convenio = new { p.Convenio.Id, p.Convenio.Nome }
                })
                .FirstOrDefaultAsync();

            if (paciente == null)
                return NotFound();

            return Ok(paciente);
        }
    }
}
