using System.ComponentModel.DataAnnotations;
namespace AgendamentoMedico.API.DTOs
{
    public class DisponibilidadeDto
    {
        [Required(ErrorMessage = "ID do médico é obrigatório")]
        public int MedicoId { get; set; }

        [Required(ErrorMessage = "ID da especialidade é obrigatório")]
        public int EspecialidadeId { get; set; }

        [Required(ErrorMessage = "Dia da semana é obrigatório")]
        [Range(0, 6, ErrorMessage = "Dia da semana deve ser entre 0 (Domingo) e 6 (Sábado)")]
        public int DiaSemana { get; set; }

        [Required(ErrorMessage = "Hora de início é obrigatória")]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "Hora de término é obrigatória")]
        public TimeSpan HoraFim { get; set; }

        [Required(ErrorMessage = "Duração da consulta é obrigatória")]
        [Range(10, 120, ErrorMessage = "Duração deve ser entre 10 e 120 minutos")]
        public int DuracaoConsultaMinutos { get; set; }
    }

}