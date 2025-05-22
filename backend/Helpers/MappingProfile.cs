using AutoMapper;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;

namespace AgendamentoMedico.API.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {

            // Disponibilidade
            CreateMap<DisponibilidadeDto, Disponibilidade>();
            CreateMap<Disponibilidade, DisponibilidadeResponseDto>()
                .ForMember(dest => dest.MedicoNome, opt => opt.MapFrom(src => src.Medico.Nome))
                .ForMember(dest => dest.EspecialidadeNome, opt => opt.MapFrom(src => src.Especialidade.Nome));

            //Agendamentos
            CreateMap<Agendamento, AgendamentoReadDto>()
                .ForMember(dest => dest.Paciente, opt => opt.MapFrom(src => src.Paciente.Nome))
                .ForMember(dest => dest.Especialidade, opt => opt.MapFrom(src => src.Especialidade.Nome))
                .ForMember(dest => dest.Convenio, opt => opt.MapFrom(src => src.Convenio.Nome))
                .ForMember(dest => dest.Medico, opt => opt.MapFrom(src => src.Medico.Nome))
                .ForMember(dest => dest.DataHora, opt => opt.MapFrom(src => src.DataHora.ToString("yyyy-MM-ddTHH:mm:ssZ")))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status));

            // Atendimentos
            CreateMap<Atendimento, AtendimentoReadDto>()
                .ForMember(dest => dest.Paciente, opt => opt.MapFrom(src => src.Agendamento.Paciente.Nome))
                .ForMember(dest => dest.Medico, opt => opt.MapFrom(src => src.Agendamento.Medico.Nome))
                .ForMember(dest => dest.Especialidade, opt => opt.MapFrom(src => src.Agendamento.Especialidade.Nome))
                .ForMember(dest => dest.Convenio, opt => opt.MapFrom(src => src.Agendamento.Convenio.Nome))
                .ForMember(dest => dest.DataConsulta, opt => opt.MapFrom(src => src.Agendamento.DataHora))
                .ForMember(dest => dest.StatusConsulta, opt => opt.MapFrom(src => src.Agendamento.Status));


            // Especialidades
            CreateMap<Especialidade, EspecialidadeReadDto>();
            CreateMap<EspecialidadeCreateDto, Especialidade>();
            CreateMap<EspecialidadeUpdateDto, Especialidade>();

            // Convênios
            CreateMap<Convenio, ConvenioReadDto>();
            CreateMap<ConvenioCreateDto, Convenio>();
            CreateMap<ConvenioUpdateDto, Convenio>();

            // Pacientes
            CreateMap<Paciente, PacienteReadDto>()
                .ForMember(dest => dest.ConvenioNome, opt => opt.MapFrom(src => src.Convenio != null ? src.Convenio.Nome : null))
                .ForMember(dest => dest.ConvenioId, opt => opt.MapFrom(src => src.Convenio != null ? src.Convenio.Id : (int?)null));

            CreateMap<PacienteCreateDto, Paciente>();
            CreateMap<PacienteUpdateDto, Paciente>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Médicos
            CreateMap<Medico, MedicoReadDto>()
                .ForMember(dest => dest.Especialidades, opt => opt.MapFrom(src =>
                    (src.MedicoEspecialidades ?? Enumerable.Empty<MedicoEspecialidade>())
                        .Select(me => me.Especialidade)));

            CreateMap<MedicoCreateDto, Medico>()
                .ForMember(dest => dest.MedicoEspecialidades, opt => opt.MapFrom(src =>
                    (src.EspecialidadeIds ?? Enumerable.Empty<int>()).Select(id => new MedicoEspecialidade { EspecialidadeId = id })));

            CreateMap<MedicoUpdateDto, Medico>()
                .ForMember(dest => dest.MedicoEspecialidades, opt => opt.Ignore());

            // Mapeamentos para atualizações parciais
            CreateMap<ConvenioUpdateDto, Convenio>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<PacienteUpdateDto, Paciente>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<MedicoUpdateDto, Medico>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}