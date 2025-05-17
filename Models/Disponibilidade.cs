using System.ComponentModel.DataAnnotations;

namespace AgendamentoMedico.API.Models
{
    public class Disponibilidade
    {
        public int Id { get; set; }
        public int MedicoId { get; set; }
        public Medico Medico { get; set; } = null!;
        public int EspecialidadeId { get; set; }
        public Especialidade Especialidade { get; set; } = null!;
        public int DiaSemana { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFim { get; set; }
        public int DuracaoConsultaMinutos { get; set; }
    }
}
