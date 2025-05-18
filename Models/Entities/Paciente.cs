namespace AgendamentoMedico.API.Models
{
    public class Paciente
    {
        public int Id { get; set; }
        public string Nome { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Telefone { get; set; } = null!;
        
        public int ConvenioId { get; set; }
        public Convenio Convenio { get; set; } = null!;
    }
}