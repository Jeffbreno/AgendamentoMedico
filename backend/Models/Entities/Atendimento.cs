namespace AgendamentoMedico.API.Models
{
    public class Atendimento
    {
        public int Id { get; set; }

        public int AgendamentoId { get; set; }
        public Agendamento Agendamento { get; set; } = null!;

        public DateTime DataAtendimento { get; set; } = DateTime.UtcNow;

        public string? Observacoes { get; set; }
    }
}
