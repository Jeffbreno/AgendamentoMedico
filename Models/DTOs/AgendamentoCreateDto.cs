namespace AgendamentoMedico.API.DTOs
{
    public class AgendamentoCreateDto
    {
        public int PacienteId { get; set; }
        public int EspecialidadeId { get; set; }
        public int ConvenioId { get; set; }
        public DateTime DataHora { get; set; }
    }
}
