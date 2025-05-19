using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgendamentoMedico.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MedicosController(ApplicationDbContext context, IMapper mapper) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        // GET: api/medicos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MedicoReadDto>>> GetMedicos()
        {
            var medicos = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                    .ThenInclude(me => me.Especialidade)
                .ToListAsync();

            return Ok(_mapper.Map<IEnumerable<MedicoReadDto>>(medicos));
        }

        // GET: api/medicos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MedicoReadDto>> GetMedico(int id)
        {
            var medico = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                    .ThenInclude(me => me.Especialidade)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medico == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<MedicoReadDto>(medico));
        }

        // POST: api/medicos
        [HttpPost]
        public async Task<ActionResult<MedicoReadDto>> CreateMedico(MedicoCreateDto medicoCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Verifica se todas especialidades existem
            var especialidadesExistentes = await _context.Especialidades
                .Where(e => medicoCreateDto.EspecialidadeIds.Contains(e.Id))
                .CountAsync();

            if (especialidadesExistentes != medicoCreateDto.EspecialidadeIds.Count)
            {
                return BadRequest("Uma ou mais especialidades não existem");
            }

            var medico = _mapper.Map<Medico>(medicoCreateDto);

            _context.Medicos.Add(medico);
            await _context.SaveChangesAsync();

            // Carrega as relações para retornar o DTO completo
            var medicoCompleto = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                    .ThenInclude(me => me.Especialidade)
                .FirstOrDefaultAsync(m => m.Id == medico.Id);

            return CreatedAtAction(nameof(GetMedico),
                new { id = medico.Id },
                _mapper.Map<MedicoReadDto>(medicoCompleto));
        }

        // PATCH: api/medicos/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PartialUpdateMedico(int id, MedicoUpdateDto medicoUpdateDto)
        {
            // if (id != medicoUpdateDto.Id)
            // {
            //     return BadRequest("ID da URL não corresponde ao ID do corpo");
            // }

            var medico = await _context.Medicos
                .Include(m => m.MedicoEspecialidades)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (medico == null)
            {
                return NotFound();
            }

            // Verifica especialidades se foram fornecidas
            if (medicoUpdateDto.EspecialidadeIds != null && medicoUpdateDto.EspecialidadeIds.Any())
            {
                var especialidadesExistentes = await _context.Especialidades
                    .Where(e => medicoUpdateDto.EspecialidadeIds.Contains(e.Id))
                    .CountAsync();

                if (especialidadesExistentes != medicoUpdateDto.EspecialidadeIds.Count)
                {
                    return BadRequest("Uma ou mais especialidades não existem");
                }

                // Atualiza especialidades
                _context.MedicoEspecialidades.RemoveRange(medico.MedicoEspecialidades);

                medico.MedicoEspecialidades = medicoUpdateDto.EspecialidadeIds
                    .Select(eid => new MedicoEspecialidade { EspecialidadeId = eid })
                    .ToList();
            }

            // Atualiza apenas os campos não nulos
            if (medicoUpdateDto.Nome != null)
            {
                medico.Nome = medicoUpdateDto.Nome;
            }

            _mapper.Map(medicoUpdateDto, medico, opts =>
                opts.Items["IgnoreNullValues"] = true);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MedicoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/medicos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMedico(int id)
        {
            var medico = await _context.Medicos.FindAsync(id);
            if (medico == null)
            {
                return NotFound();
            }

            _context.Medicos.Remove(medico);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool MedicoExists(int id)
        {
            return _context.Medicos.Any(e => e.Id == id);
        }
    }
}