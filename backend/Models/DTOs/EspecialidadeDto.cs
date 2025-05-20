using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.DTOs
{
    public class EspecialidadeCreateDto
    {
        [Required(ErrorMessage = "O nome da especialidade é obrigatório")]
        [StringLength(125, ErrorMessage = "O nome não pode exceder 125 caracteres")]
        public string Nome { get; set; } = null!;
    }

    public class EspecialidadeUpdateDto
    {
        [Required(ErrorMessage = "O nome da especialidade é obrigatório")]
        [StringLength(125, ErrorMessage = "O nome não pode exceder 100 caracteres")]
        public string Nome { get; set; } = null!;
    }
    public class EspecialidadeReadDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
    }
}
