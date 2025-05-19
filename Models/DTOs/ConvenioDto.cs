using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.DTOs
{
    public class ConvenioCreateDto
    {
        [Required]
        [StringLength(125)]
        public string Nome { get; set; } = null!;
    }

    public class ConvenioReadDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
    }
}
