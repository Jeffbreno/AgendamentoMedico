using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DisponibilidadesController(ApplicationDbContext context) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;

        /// <summary>
        /// Define uma nova disponibilidade para um médico
        /// </summary>
        /// <param name="dto">Dados da disponibilidade</param>
        /// <returns>Retorna a disponibilidade criada</returns>
        // POST: /api/disponibilidades/definir
        [HttpPost("definir")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DefinirDisponibilidade([FromBody] DisponibilidadeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var medico = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                .FirstOrDefaultAsync(m => m.Id == dto.MedicoId);

            if (medico == null)
                return NotFound(new { Message = "Médico não encontrado." });

            var especialidade = await _context.Especialidades
                .FindAsync(dto.EspecialidadeId);

            if (especialidade == null)
                return NotFound(new { Message = "Especialidade não encontrada" });

            bool temEspecialidade = medico.MedicoEspecialidades
                .Any(e => e.EspecialidadeId == dto.EspecialidadeId);

            if (!temEspecialidade)
                return BadRequest(new { Message = "O médico não possui essa especialidade." });

            if (dto.HoraInicio >= dto.HoraFim)
                return BadRequest(new { Message = "Hora de início deve ser anterior à hora de término." });

            bool existeConflito = await _context.Disponibilidades
                .AnyAsync(d =>
                    d.MedicoId == dto.MedicoId &&
                    d.DiaSemana == dto.DiaSemana &&
                    (
                        (dto.HoraInicio >= d.HoraInicio && dto.HoraInicio < d.HoraFim) ||
                        (dto.HoraFim > d.HoraInicio && dto.HoraFim <= d.HoraFim) ||
                        (dto.HoraInicio <= d.HoraInicio && dto.HoraFim >= d.HoraFim)
                    ));

            if (existeConflito)
                return BadRequest(new { Message = "Conflito de horário" });

            var novaDisponibilidade = new Disponibilidade
            {
                MedicoId = dto.MedicoId,
                EspecialidadeId = dto.EspecialidadeId,
                DiaSemana = dto.DiaSemana,
                HoraInicio = dto.HoraInicio,
                HoraFim = dto.HoraFim,
                DuracaoConsultaMinutos = dto.DuracaoConsultaMinutos,
                Medico = medico,
                Especialidade = especialidade
            };

            await _context.Disponibilidades.AddAsync(novaDisponibilidade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(DefinirDisponibilidade),
                new { id = novaDisponibilidade.Id },
                new DisponibilidadeResponseDto
                {
                    Id = novaDisponibilidade.Id,
                    MedicoId = novaDisponibilidade.MedicoId,
                    MedicoNome = novaDisponibilidade.Medico.Nome,
                    EspecialidadeId = novaDisponibilidade.EspecialidadeId,
                    EspecialidadeNome = novaDisponibilidade.Especialidade.Nome,
                    DiaSemana = novaDisponibilidade.DiaSemana,
                    HoraInicio = novaDisponibilidade.HoraInicio.ToString("hh\\:mm"),
                    HoraFim = novaDisponibilidade.HoraFim.ToString("hh\\:mm"),
                    DuracaoConsultaMinutos = novaDisponibilidade.DuracaoConsultaMinutos
                });
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ListarHorariosDisponiveis([FromBody] ConsultaHorariosDto dto)
        {
            if (dto.Data == default)
                return BadRequest(new { Message = "Data inválida." });

            int diaSemana = (int)dto.Data.DayOfWeek;

            var disponibilidadesQuery = _context.Disponibilidades
                .Include(d => d.Medico)
                .Where(d =>
                    d.EspecialidadeId == dto.EspecialidadeId &&
                    d.DiaSemana == diaSemana);

            if (!string.IsNullOrEmpty(dto.Medico))
            {
                disponibilidadesQuery = disponibilidadesQuery
                    .Where(d => d.Medico.Nome == dto.Medico);
            }

            var disponibilidades = await disponibilidadesQuery.ToListAsync();

            if (disponibilidades.Count == 0)
                return Ok(new List<object>());

            var horarios = new List<object>();

            foreach (var disp in disponibilidades)
            {
                var horaAtual = dto.Data.Date + disp.HoraInicio;
                var horaFim = dto.Data.Date + disp.HoraFim;
                var duracao = TimeSpan.FromMinutes(disp.DuracaoConsultaMinutos);

                while (horaAtual + duracao <= horaFim)
                {
                    var agendamento = await _context.Agendamentos
                        .Include(a => a.Paciente)
                        .FirstOrDefaultAsync(a =>
                            a.MedicoId == disp.MedicoId &&
                            a.DataHora == horaAtual);

                    if (agendamento != null)
                    {
                        horarios.Add(new
                        {
                            horaInicio = horaAtual.ToString("HH:mm"),
                            horaFim = (horaAtual + duracao).ToString("HH:mm"),
                            disponivel = false,
                            agendamentoId = agendamento.Id,
                            paciente = agendamento.Paciente.Nome
                        });
                    }
                    else
                    {
                        horarios.Add(new
                        {
                            horaInicio = horaAtual.ToString("HH:mm"),
                            horaFim = (horaAtual + duracao).ToString("HH:mm"),
                            disponivel = true
                        });
                    }

                    horaAtual += duracao;
                }
            }

            return Ok(horarios);
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var disponibilidades = await _context.Disponibilidades
                .Include(d => d.Medico)
                .Include(d => d.Especialidade)
                .ToListAsync();

            return Ok(disponibilidades.Select(d => new
            {
                d.Id,
                Medico = d.Medico.Nome,
                Especialidade = d.Especialidade.Nome,
                d.DiaSemana,
                d.HoraInicio,
                d.HoraFim,
                d.DuracaoConsultaMinutos
            }));
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeletarDisponibilidade(int id)
        {
            var disponibilidade = await _context.Disponibilidades.FindAsync(id);
            if (disponibilidade == null)
                return NotFound(new { Message = "Disponibilidade não encontrada." });

            _context.Disponibilidades.Remove(disponibilidade);
            await _context.SaveChangesAsync();

            return NoContent();
        }


    }
}
