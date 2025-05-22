// Reescrito com base nas boas práticas sugeridas
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
    public class AgendamentosController(ApplicationDbContext context, IMapper mapper) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        private readonly List<string> _statusValidos = ["Agendado", "Confirmado", "Cancelado", "Realizado", "Falta"];

        // POST: /api/agendamentos
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(AgendamentoReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CriarAgendamento([FromBody] AgendamentoCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (!string.IsNullOrEmpty(dto.Status) && !_statusValidos.Contains(dto.Status))
                return BadRequest($"Status inválido. Os status válidos são: {string.Join(", ", _statusValidos)}");

            var paciente = await _context.Pacientes.Include(p => p.Convenio)
                .FirstOrDefaultAsync(p => p.Id == dto.PacienteId);

            if (paciente == null)
                return BadRequest("Paciente não encontrado.");

            if (paciente.ConvenioId != dto.ConvenioId)
                return BadRequest("Convênio do paciente não corresponde.");

            var especialidade = await _context.Especialidades.FindAsync(dto.EspecialidadeId);
            if (especialidade == null)
                return BadRequest("Especialidade não encontrada.");

            var convenio = await _context.Convenios.FindAsync(dto.ConvenioId);
            if (convenio == null)
                return BadRequest("Convênio não encontrado.");

            int diaSemana = (int)dto.DataHora.DayOfWeek;

            var disponibilidade = _context.Disponibilidades
                .Include(d => d.Medico)
                .Where(d =>
                    d.EspecialidadeId == dto.EspecialidadeId &&
                    d.DiaSemana == diaSemana &&
                    dto.DataHora.TimeOfDay >= d.HoraInicio)
                .AsEnumerable()
                .FirstOrDefault(d =>
                    dto.DataHora.TimeOfDay + TimeSpan.FromMinutes(d.DuracaoConsultaMinutos) <= d.HoraFim);

            if (disponibilidade == null)
                return BadRequest("Nenhuma disponibilidade encontrada para este horário.");

            bool conflito = await _context.Agendamentos
                .AnyAsync(a => a.MedicoId == disponibilidade.MedicoId && a.DataHora == dto.DataHora);

            if (conflito)
                return BadRequest("Horário já agendado.");

            var agendamento = new Agendamento
            {
                PacienteId = dto.PacienteId,
                ConvenioId = dto.ConvenioId,
                EspecialidadeId = dto.EspecialidadeId,
                MedicoId = disponibilidade.MedicoId,
                DataHora = dto.DataHora,
                Status = dto.Status ?? "Agendado"
            };

            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            var agendamentoReadDto = _mapper.Map<AgendamentoReadDto>(agendamento);
            return CreatedAtAction(nameof(ObterAgendamentoPorId), new { id = agendamento.Id }, agendamentoReadDto);
        }

        // GET: /api/agendamentos
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<AgendamentoReadDto>))]
        public async Task<IActionResult> GetAgendamentos(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string? paciente,
            [FromQuery] string? status)
        {
            var query = _context.Agendamentos
                .Include(a => a.Paciente)
                .Include(a => a.Especialidade)
                .Include(a => a.Convenio)
                .Include(a => a.Medico)
                .AsQueryable();

            if (!dataInicio.HasValue && !dataFim.HasValue && string.IsNullOrEmpty(paciente))
            {
                query = query.Where(a => a.DataHora >= DateTime.Today);
            }

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataHora >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataHora <= dataFim.Value);

            if (!string.IsNullOrWhiteSpace(paciente))
                query = query.Where(a => a.Paciente.Nome.Contains(paciente));

            if (!string.IsNullOrWhiteSpace(status) && _statusValidos.Contains(status))
                query = query.Where(a => a.Status == status);

            var agendamentos = await query.OrderBy(a => a.DataHora).ToListAsync();
            var agendamentosDto = _mapper.Map<List<AgendamentoReadDto>>(agendamentos);

            return Ok(agendamentosDto);
        }

        // GET: /api/agendamentos/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AgendamentoReadDto))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ObterAgendamentoPorId(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Paciente)
                .Include(a => a.Especialidade)
                .Include(a => a.Convenio)
                .Include(a => a.Medico)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null)
                return NotFound();

            var agendamentoDto = _mapper.Map<AgendamentoReadDto>(agendamento);
            return Ok(agendamentoDto);
        }

        // PATCH: /api/agendamentos/{id}/status
        [HttpPatch("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AgendamentoReadDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] string novoStatus)
        {
            if (!_statusValidos.Contains(novoStatus))
                return BadRequest($"Status inválido. Os status válidos são: {string.Join(", ", _statusValidos)}");

            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null)
                return NotFound();

            agendamento.Status = novoStatus;
            await _context.SaveChangesAsync();

            await _context.Entry(agendamento).Reference(a => a.Paciente).LoadAsync();
            await _context.Entry(agendamento).Reference(a => a.Especialidade).LoadAsync();
            await _context.Entry(agendamento).Reference(a => a.Convenio).LoadAsync();
            await _context.Entry(agendamento).Reference(a => a.Medico).LoadAsync();

            var agendamentoDto = _mapper.Map<AgendamentoReadDto>(agendamento);
            return Ok(agendamentoDto);
        }
    }
}
