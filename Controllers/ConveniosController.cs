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
    public class ConveniosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ConveniosController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        // GET: api/convenios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConvenioReadDto>>> GetConvenios()
        {
            var convenios = await _context.Convenios.ToListAsync();
            return Ok(_mapper.Map<IEnumerable<ConvenioReadDto>>(convenios));
        }

        // GET: api/convenios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ConvenioReadDto>> GetConvenio(int id)
        {
            var convenio = await _context.Convenios.FindAsync(id);

            if (convenio == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<ConvenioReadDto>(convenio));
        }

        // POST: api/convenios
        [HttpPost]
        public async Task<ActionResult<ConvenioReadDto>> CreateConvenio(ConvenioCreateDto convenioCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var convenio = _mapper.Map<Convenio>(convenioCreateDto);
            
            _context.Convenios.Add(convenio);
            await _context.SaveChangesAsync();

            var convenioReadDto = _mapper.Map<ConvenioReadDto>(convenio);
            
            return CreatedAtAction(nameof(GetConvenio), 
                new { id = convenioReadDto.Id }, 
                convenioReadDto);
        }

        // PATCH: api/convenios/5
        [HttpPatch("{id}")]
        public async Task<IActionResult> PartialConvenio(int id, ConvenioUpdateDto convenioUpdateDto)
        {
            var convenio = await _context.Convenios.FindAsync(id);
            if (convenio == null)
            {
                return NotFound();
            }

            _mapper.Map(convenioUpdateDto, convenio);
            
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ConvenioExists(id))
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

        // DELETE: api/convenios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConvenio(int id)
        {
            var convenio = await _context.Convenios.FindAsync(id);
            if (convenio == null)
            {
                return NotFound();
            }

            // Verifica se existem pacientes associados
            var pacientesComConvenio = await _context.Pacientes
                .AnyAsync(p => p.ConvenioId == id);
            
            if (pacientesComConvenio)
            {
                return BadRequest("Não é possível excluir o convênio pois existem pacientes associados");
            }

            _context.Convenios.Remove(convenio);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ConvenioExists(int id)
        {
            return _context.Convenios.Any(e => e.Id == id);
        }
    }
}