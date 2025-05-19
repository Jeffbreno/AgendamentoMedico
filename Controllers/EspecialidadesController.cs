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
    public class EspecialidadesController(ApplicationDbContext context, IMapper mapper) : ControllerBase
    {
        private readonly ApplicationDbContext _context = context;
        private readonly IMapper _mapper = mapper;

        // GET: /api/especialidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EspecialidadeReadDto>>> GetEspecialidades()
        {
            var especialidades = await _context.Especialidades.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<EspecialidadeReadDto>>(especialidades));
        }

        // GET: api/especialidades/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EspecialidadeReadDto>> GetEspecialidade(int id)
        {
            var especialidade = await _context.Especialidades.FindAsync(id);

            if (especialidade == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<EspecialidadeReadDto>(especialidade));
        }

        // POST: /api/especialidades
        [HttpPost]
        public async Task<ActionResult<EspecialidadeReadDto>> CreateEspecialidade([FromBody] EspecialidadeCreateDto especialidadeCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var especialidade = _mapper.Map<Especialidade>(especialidadeCreateDto);

            _context.Especialidades.Add(especialidade);
            await _context.SaveChangesAsync();

            var especialidadeReadDto = _mapper.Map<EspecialidadeReadDto>(especialidade);

            return CreatedAtAction(nameof(GetEspecialidade),
                new { id = especialidadeReadDto.Id },
                especialidadeReadDto);
        }

        // PUT: api/especialidades/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEspecialidade(int id, EspecialidadeUpdateDto especialidadeUpdateDto)
        {
            if (id != especialidadeUpdateDto.Id)
            {
                return BadRequest("ID da URL não corresponde ao ID do corpo da requisição");
            }

            var especialidade = await _context.Especialidades.FindAsync(id);
            if (especialidade == null)
            {
                return NotFound($"Especialidade com ID {id} não encontrada");
            }

            _mapper.Map(especialidadeUpdateDto, especialidade);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EspecialidadeExists(id))
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

        // DELETE: api/especialidades/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEspecialidade(int id)
        {
            var especialidade = await _context.Especialidades.FindAsync(id);
            if (especialidade == null)
            {
                return NotFound();
            }

            _context.Especialidades.Remove(especialidade);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool EspecialidadeExists(int id)
        {
            return _context.Especialidades.Any(e => e.Id == id);
        }

    }
}
