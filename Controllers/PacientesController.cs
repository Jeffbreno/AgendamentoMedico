using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacientesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public PacientesController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/pacientes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PacienteReadDto>>> GetPacientes()
        {
            var pacientes = await _context.Pacientes
                .Include(p => p.Convenio)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<PacienteReadDto>>(pacientes));
        }

        // GET: api/pacientes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PacienteReadDto>> GetPaciente(int id)
        {
            var paciente = await _context.Pacientes
                .Include(p => p.Convenio)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paciente == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<PacienteReadDto>(paciente));
        }

        // POST: api/pacientes
        [HttpPost]
        public async Task<ActionResult<PacienteReadDto>> CreatePaciente(PacienteCreateDto pacienteCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var convenio = await _context.Convenios.FindAsync(pacienteCreateDto.ConvenioId);
            if (convenio == null)
            {
                return BadRequest("Convênio não encontrado");
            }

            var paciente = _mapper.Map<Paciente>(pacienteCreateDto);

            _context.Pacientes.Add(paciente);
            await _context.SaveChangesAsync();

            // Carrega o convênio para retornar no DTO
            await _context.Entry(paciente)
                .Reference(p => p.Convenio)
                .LoadAsync();

            var pacienteReadDto = _mapper.Map<PacienteReadDto>(paciente);

            return CreatedAtAction(nameof(GetPaciente),
                new { id = pacienteReadDto.Id },
                pacienteReadDto);
        }

        // PATCH: api/pacientes/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PartialPaciente(int id, PacienteUpdateDto pacienteUpdateDto)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var paciente = await _context.Pacientes
                .Include(p => p.Convenio)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (paciente == null) return NotFound();

            // Verifica se o novo convênio existe (se foi fornecido)
            if (pacienteUpdateDto.ConvenioId.HasValue)
            {
                var convenio = await _context.Convenios
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == pacienteUpdateDto.ConvenioId.Value);

                 if (convenio == null)
                {
                    return BadRequest("O convênio especificado não existe");
                }
            }

            // Aplica apenas as atualizações não-nulas
            if (pacienteUpdateDto.Nome != null)
            {
                paciente.Nome = pacienteUpdateDto.Nome;
            }

            if (pacienteUpdateDto.Email != null)
            {
                paciente.Email = pacienteUpdateDto.Email;
            }

            if (pacienteUpdateDto.Telefone != null)
            {
                paciente.Telefone = pacienteUpdateDto.Telefone;
            }

            if (pacienteUpdateDto.ConvenioId.HasValue)
            {
                paciente.ConvenioId = pacienteUpdateDto.ConvenioId.Value;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                Console.WriteLine($"Erro ao atualizar paciente: {ex.InnerException?.Message}");
                return StatusCode(500, "Erro ao atualizar paciente");
            }

            return NoContent();
        }

        // DELETE: api/pacientes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaciente(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null)
            {
                return NotFound();
            }

            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool PacienteExists(int id)
        {
            return _context.Pacientes.Any(e => e.Id == id);
        }
    }
}