using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgendamentoMedico.API.DTOs
{
    public class PacienteCreateDto
    {
        [Required(ErrorMessage = "O nome do paciente é obrigatório")]
        [StringLength(125, ErrorMessage = "O nome não pode exceder 125 caracteres")]
        public string Nome { get; set; } = null!;

        [EmailAddress(ErrorMessage = "Email inválido")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Telefone inválido")]
        public string? Telefone { get; set; }

        [Required(ErrorMessage = "O convênio é obrigatório")]
        public int ConvenioId { get; set; }
    }

    public class PacienteReadDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public string ConvenioNome { get; set; } = null!;
        public int ConvenioId { get; set; }
    }

    public class PacienteUpdateDto
    {
        [StringLength(125, ErrorMessage = "O nome não pode exceder 125 caracteres")]
        public string? Nome { get; set; }

        [EmailAddress(ErrorMessage = "Email inválido")]
        public string? Email { get; set; }

        [Phone(ErrorMessage = "Telefone inválido")]
        public string? Telefone { get; set; }

        [ForeignKey("Convenio")]
        public int? ConvenioId { get; set; }
    }
}
