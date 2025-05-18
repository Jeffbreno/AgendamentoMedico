using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendamentosController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        // POST: /api/agendamentos
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CriarAgendamento([FromBody] AgendamentoCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

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

            // Encontrar uma disponibilidade compatível
            var disponibilidade = await _context.Disponibilidades
                .Include(d => d.Medico)
                .Where(d =>
                    d.EspecialidadeId == dto.EspecialidadeId &&
                    d.DiaSemana == diaSemana &&
                    dto.DataHora.TimeOfDay >= d.HoraInicio &&
                    dto.DataHora.TimeOfDay + TimeSpan.FromMinutes(d.DuracaoConsultaMinutos) <= d.HoraFim)
                .FirstOrDefaultAsync();

            if (disponibilidade == null)
                return BadRequest("Nenhuma disponibilidade encontrada para este horário.");

            // Verificar se já existe agendamento no horário
            bool conflito = await _context.Agendamentos
                .AnyAsync(a =>
                    a.MedicoId == disponibilidade.MedicoId &&
                    a.DataHora == dto.DataHora);

            if (conflito)
                return BadRequest("Horário já agendado.");

            var agendamento = new Agendamento
            {
                PacienteId = dto.PacienteId,
                ConvenioId = dto.ConvenioId,
                EspecialidadeId = dto.EspecialidadeId,
                MedicoId = disponibilidade.MedicoId,
                DataHora = dto.DataHora
            };

            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CriarAgendamento), new { id = agendamento.Id }, new
            {
                agendamento.Id,
                paciente = paciente.Nome,
                agendamento.EspecialidadeId,
                especialidadeNome = especialidade.Nome,
                agendamento.ConvenioId,
                convenioNome = convenio.Nome,
                dataHora = agendamento.DataHora.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                medico = disponibilidade.Medico.Nome
            });
        }

        // GET: /api/agendamentos?dataInicio=AAAA-MM-DD&dataFim=AAAA-MM-DD&paciente=Nome
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAgendamentos(
            [FromQuery] DateTime? dataInicio,
            [FromQuery] DateTime? dataFim,
            [FromQuery] string? paciente)
        {
            var query = _context.Agendamentos
                .Include(a => a.Paciente)
                .Include(a => a.Especialidade)
                .Include(a => a.Convenio)
                .Include(a => a.Medico)
                .AsQueryable();

            if (dataInicio.HasValue)
                query = query.Where(a => a.DataHora >= dataInicio.Value);

            if (dataFim.HasValue)
                query = query.Where(a => a.DataHora <= dataFim.Value);

            if (!string.IsNullOrWhiteSpace(paciente))
                query = query.Where(a => a.Paciente.Nome.Contains(paciente));

            var resultados = await query
                .OrderBy(a => a.DataHora)
                .Select(a => new
                {
                    a.Id,
                    Paciente = a.Paciente.Nome,
                    Especialidade = a.Especialidade.Nome,
                    Convenio = a.Convenio.Nome,
                    Medico = a.Medico.Nome,
                    DataHora = a.DataHora.ToString("yyyy-MM-ddTHH:mm:ssZ")
                })
                .ToListAsync();

            return Ok(resultados);
        }

    }
}
