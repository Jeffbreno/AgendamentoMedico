namespace AgendamentoMedico.API.Models
{
    public class Convenio
    {
        public int Id { get; set; }
        public required string Nome { get; set; }
        public ICollection<Paciente>? Pacientes { get; set; }
    }
}
