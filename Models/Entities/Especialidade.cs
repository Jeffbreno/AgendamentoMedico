using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.Models
{
    public class Especialidade
    {
        public int Id { get; set; }

        [Required]
        [StringLength(125)]
        public string Nome { get; set; } = null!;
        public ICollection<MedicoEspecialidade> MedicoEspecialidades { get; set; } = new List<MedicoEspecialidade>();
    }
}
