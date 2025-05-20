namespace AgendamentoMedico.API.Models
{
    public class Agendamento
    {
        public int Id { get; set; }
        public int PacienteId { get; set; }
        public Paciente Paciente { get; set; } = null!;

        public int MedicoId { get; set; }
        public Medico Medico { get; set; } = null!;

        public int EspecialidadeId { get; set; }
        public Especialidade Especialidade { get; set; } = null!;

        public int ConvenioId { get; set; }
        public Convenio Convenio { get; set; } = null!;

        public DateTime DataHora { get; set; }
        public string Status { get; set; } = "Agendado";
    }
}
