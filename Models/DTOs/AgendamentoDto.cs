using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.DTOs
{
    public class AgendamentoCreateDto
    {
        [Required]
        public int PacienteId { get; set; }

        [Required]
        public int ConvenioId { get; set; }

        [Required]
        public int EspecialidadeId { get; set; }

        [Required]
        public DateTime DataHora { get; set; }
        
        public string? Status { get; set; }
    }

    public class AgendamentoReadDto
    {
        public int Id { get; set; }
        public string Paciente { get; set; }
        public string Especialidade { get; set; }
        public string Convenio { get; set; }
        public string Medico { get; set; }
        public string DataHora { get; set; }
        public string Status { get; set; }
    }
}
