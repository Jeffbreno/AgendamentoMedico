namespace AgendamentoMedico.API.DTOs
{
    public class MedicoCreateDto
    {
        public string Nome { get; set; } = null!;
        public List<int> EspecialidadeIds { get; set; } = null!;
    }
}
