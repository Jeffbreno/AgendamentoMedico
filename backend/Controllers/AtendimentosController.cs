// Reescrito com AutoMapper para manter consistência com o projeto
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
    public class AtendimentosController(ApplicationDbContext context, IMapper mapper) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        // POST: /api/atendimentos
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(AtendimentoReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarAtendimento([FromBody] AtendimentoCreateDto dto)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Paciente)
                .Include(a => a.Medico)
                .Include(a => a.Especialidade)
                .Include(a => a.Convenio)
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

            await _context.Entry(atendimento)
                .Reference(a => a.Agendamento)
                .Query()
                .Include(a => a.Paciente)
                .Include(a => a.Medico)
                .Include(a => a.Especialidade)
                .Include(a => a.Convenio)
                .LoadAsync();

            var atendimentoDto = _mapper.Map<AtendimentoReadDto>(atendimento);
            return CreatedAtAction(nameof(CriarAtendimento), new { id = atendimento.Id }, atendimentoDto);
        }

        // GET: /api/atendimentos?dataInicio=...&dataFim=...&paciente=...
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<AtendimentoReadDto>))]
        public async Task<IActionResult> GetAtendimentos(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string? paciente)
        {
            var query = _context.Atendimentos
                .Include(a => a.Agendamento)
                .ThenInclude(a => a.Paciente)
                .Include(a => a.Agendamento.Medico)
                .Include(a => a.Agendamento.Especialidade)
                .Include(a => a.Agendamento.Convenio)
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataAtendimento >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataAtendimento <= dataFim.Value);

            if (!string.IsNullOrWhiteSpace(paciente))
                query = query.Where(a => a.Agendamento.Paciente.Nome.Contains(paciente));

            var atendimentos = await query
                .OrderByDescending(a => a.DataAtendimento)
                .ToListAsync();

            var atendimentosDto = _mapper.Map<List<AtendimentoReadDto>>(atendimentos);
            return Ok(atendimentosDto);
        }
    }
}