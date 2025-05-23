namespace AgendamentoMedico.API.DTOs
{
    public class ConsultaHorariosDto
    {
        public int EspecialidadeId { get; set; }
        public DateTime Data { get; set; }
        public int? MedicoId { get; set; }
    }
}
