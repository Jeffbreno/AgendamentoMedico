// Reescrito com base na mudança de filtro: agora usa MedicoId ao invés de nome
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

        [HttpPost("definir")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DefinirDisponibilidade([FromBody] DisponibilidadeDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var medico = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                .FirstOrDefaultAsync(m => m.Id == dto.MedicoId);

            if (medico == null) return NotFound(new { Message = "Médico não encontrado." });

            var especialidade = await _context.Especialidades.FindAsync(dto.EspecialidadeId);
            if (especialidade == null) return NotFound(new { Message = "Especialidade não encontrada" });

            bool temEspecialidade = await _context.MedicoEspecialidades
                .AnyAsync(me => me.MedicoId == dto.MedicoId && me.EspecialidadeId == dto.EspecialidadeId);
                
            if (!temEspecialidade)
                return BadRequest(new { Message = "O médico não possui essa especialidade." });

            if (dto.HoraInicio >= dto.HoraFim)
                return BadRequest(new { Message = "Hora de início deve ser anterior à hora de término." });

            bool existeConflito = await _context.Disponibilidades.AnyAsync(d =>
                d.MedicoId == dto.MedicoId &&
                d.DiaSemana == dto.DiaSemana &&
                (
                    (dto.HoraInicio >= d.HoraInicio && dto.HoraInicio < d.HoraFim) ||
                    (dto.HoraFim > d.HoraInicio && dto.HoraFim <= d.HoraFim) ||
                    (dto.HoraInicio <= d.HoraInicio && dto.HoraFim >= d.HoraFim)
                ));

            if (existeConflito)
                return BadRequest(new { Message = "Conflito de horário" });

            var nova = new Disponibilidade
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

            _context.Disponibilidades.Add(nova);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(DefinirDisponibilidade), new { id = nova.Id }, new DisponibilidadeResponseDto
            {
                Id = nova.Id,
                MedicoId = nova.MedicoId,
                MedicoNome = nova.Medico.Nome,
                EspecialidadeId = nova.EspecialidadeId,
                EspecialidadeNome = nova.Especialidade.Nome,
                DiaSemana = nova.DiaSemana,
                HoraInicio = nova.HoraInicio.ToString("hh\\:mm"),
                HoraFim = nova.HoraFim.ToString("hh\\:mm"),
                DuracaoConsultaMinutos = nova.DuracaoConsultaMinutos
            });
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ListarHorariosDisponiveis([FromBody] ConsultaHorariosDto dto)
        {
            if (dto.Data == default) return BadRequest(new { Message = "Data inválida." });

            int diaSemana = (int)dto.Data.DayOfWeek;

            var query = _context.Disponibilidades
                .Include(d => d.Medico)
                .Where(d => d.EspecialidadeId == dto.EspecialidadeId && d.DiaSemana == diaSemana);

            if (dto.MedicoId.HasValue)
                query = query.Where(d => d.MedicoId == dto.MedicoId.Value);

            var disponibilidades = await query.ToListAsync();
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
