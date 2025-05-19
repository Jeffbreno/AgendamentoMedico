using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.DTOs
{
    public class ConvenioCreateDto
    {
        [Required(ErrorMessage = "O nome do convênio é obrigatório")]
        [StringLength(125, ErrorMessage = "O nome não pode exceder 125 caracteres")]
        public string Nome { get; set; } = null!;
    }

    public class ConvenioReadDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
    }

    public class ConvenioUpdateDto
    {   
        [Required(ErrorMessage = "O nome do convênio é obrigatório")]
        [StringLength(125, ErrorMessage = "O nome não pode exceder 125 caracteres")]
        public string Nome { get; set; } = null!;
    }
}