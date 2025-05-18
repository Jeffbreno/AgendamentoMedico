namespace AgendamentoMedico.API.DTOs
{
    public class PacienteCreateDto
    {
        public string Nome { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Telefone { get; set; } = null!;
        public int ConvenioId { get; set; }
    }
}
