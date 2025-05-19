using AutoMapper;
using AgendamentoMedico.API.DTOs;
using AgendamentoMedico.API.Models;

namespace AgendamentoMedico.API.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Especialidades
            CreateMap<Especialidade, EspecialidadeReadDto>();
            CreateMap<EspecialidadeCreateDto, Especialidade>();
            CreateMap<EspecialidadeUpdateDto, Especialidade>();

            // Convênios
            CreateMap<Convenio, ConvenioReadDto>();
            CreateMap<ConvenioCreateDto, Convenio>();

            // Pacientes
            CreateMap<Paciente, PacienteReadDto>()
                .ForMember(dest => dest.ConvenioNome, opt => opt.MapFrom(src => src.Convenio.Nome));
            CreateMap<PacienteCreateDto, Paciente>();

            // Médicos
            CreateMap<Medico, MedicoReadDto>()
                .ForMember(dest => dest.Especialidades, opt => opt.MapFrom(src =>
                    src.MedicoEspecialidades.Select(me => me.Especialidade)));

            CreateMap<MedicoCreateDto, Medico>()
                .ForMember(dest => dest.MedicoEspecialidades, opt => opt.MapFrom(src =>
                    src.EspecialidadeIds.Select(id => new MedicoEspecialidade { EspecialidadeId = id })));

            // Especialidade dentro de MédicoReadDto
            CreateMap<Especialidade, EspecialidadeReadDto>();
        }
    }
}
