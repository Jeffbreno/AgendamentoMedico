using System.ComponentModel.DataAnnotations;
namespace AgendamentoMedico.API.Models
{
    public class Medico
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do médico é obrigatório")]
        [StringLength(125, MinimumLength = 5, ErrorMessage = "O nome do médico deve ter entre 5 e 125 caracteres")]
        public required string Nome { get; set; }
        public ICollection<MedicoEspecialidade> MedicoEspecialidades { get; set; } = [];
    }

    public class MedicoEspecialidade
    {
        public int MedicoId { get; set; }
        public Medico Medico { get; set; } = null!;

        public int EspecialidadeId { get; set; }
        public Especialidade Especialidade { get; set; } = null!;
    }
}
