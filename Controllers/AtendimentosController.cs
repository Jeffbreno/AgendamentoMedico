using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AtendimentosController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // POST: /api/atendimentos
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarAtendimento([FromBody] AtendimentoCreateDto dto)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Paciente)
                .FirstOrDefaultAsync(a => a.Id == dto.AgendamentoId);

            if (agendamento == null)
                return BadRequest("Agendamento não encontrado.");

            var atendimento = new Atendimento
            {
                AgendamentoId = dto.AgendamentoId,
                Observacoes = dto.Observacoes,
                DataAtendimento = DateTime.UtcNow
            };

            _context.Atendimentos.Add(atendimento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CriarAtendimento), new { id = atendimento.Id }, new
            {
                atendimento.Id,
                atendimento.AgendamentoId,
                atendimento.DataAtendimento,
                atendimento.Observacoes
            });
        }

        // GET: /api/atendimentos?dataInicio=...&dataFim=...&paciente=...
        [HttpGet]
        public async Task<IActionResult> GetAtendimentos(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string? paciente)
        {
            var query = _context.Atendimentos
                .Include(a => a.Agendamento)
                .ThenInclude(a => a.Paciente)
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataAtendimento >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataAtendimento <= dataFim.Value);

            if (!string.IsNullOrWhiteSpace(paciente))
                query = query.Where(a => a.Agendamento.Paciente.Nome.Contains(paciente));

            var resultados = await query
                .OrderByDescending(a => a.DataAtendimento)
                .Select(a => new
                {
                    a.Id,
                    a.DataAtendimento,
                    a.Observacoes,
                    Paciente = a.Agendamento.Paciente.Nome
                })
                .ToListAsync();

            return Ok(resultados);
        }
    }
}
