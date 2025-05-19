using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.DTOs
{
    public class MedicoCreateDto
    {
        [Required]
        [StringLength(125, MinimumLength = 5)]
        public string Nome { get; set; } = null!;
        public List<int>? EspecialidadeIds { get; set; }
    }

    public class MedicoReadDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
        public List<EspecialidadeReadDto> Especialidades { get; set; } = new();
    }

    public class MedicoUpdateDto
    {
        [StringLength(125)]
        public string? Nome { get; set; }

        public List<int>? EspecialidadeIds { get; set; }
    }

    public class MedicoEspecialidadeDto
    {
        public int EspecialidadeId { get; set; }
        public string EspecialidadeNome { get; set; } = null!;
    }


}
