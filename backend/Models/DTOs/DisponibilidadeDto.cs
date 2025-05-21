using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using AgendamentoMedico.API.Helpers;
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
        [JsonConverter(typeof(TimeSpanConverter))]
        public TimeSpan HoraInicio { get; set; }

        [Required(ErrorMessage = "Hora de término é obrigatória")]
        [JsonConverter(typeof(TimeSpanConverter))]
        public TimeSpan HoraFim { get; set; }

        [Required(ErrorMessage = "Duração da consulta é obrigatória")]
        [Range(10, 120, ErrorMessage = "Duração deve ser entre 10 e 120 minutos")]
        public int DuracaoConsultaMinutos { get; set; }
    }

    public class DisponibilidadeResponseDto
    {
        public int Id { get; set; }
        public int MedicoId { get; set; }
        public string MedicoNome { get; set; } // Apenas o nome, não o objeto completo
        public int EspecialidadeId { get; set; }
        public string EspecialidadeNome { get; set; }
        public int DiaSemana { get; set; }
        public string HoraInicio { get; set; }
        public string HoraFim { get; set; }
        public int DuracaoConsultaMinutos { get; set; }
    }

}