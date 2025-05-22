using AgendamentoMedico.API.Models;

namespace AgendamentoMedico.API.DTOs
{
    public class AtendimentoCreateDto
    {
        public int AgendamentoId { get; set; }
        public string? Observacoes { get; set; }
    }

    public class AtendimentoReadDto
    {
        public int Id { get; set; }
        public int AgendamentoId { get; set; }
        public DateTime DataAtendimento { get; set; }
        public string? Observacoes { get; set; }
        
        public string Paciente { get; set; } = string.Empty;
        public string Medico { get; set; } = string.Empty;
        public string Especialidade { get; set; } = string.Empty;
        public string Convenio { get; set; } = string.Empty;
        public DateTime DataConsulta { get; set; }
        public string StatusConsulta { get; set; } = string.Empty;
    }
}
