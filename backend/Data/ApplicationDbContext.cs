using Microsoft.EntityFrameworkCore;
using AgendamentoMedico.API.Models;

namespace AgendamentoMedico.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Especialidade> Especialidades { get; set; }
        public DbSet<Convenio> Convenios { get; set; }
        public DbSet<Medico> Medicos { get; set; }
        public DbSet<MedicoEspecialidade> MedicoEspecialidades { get; set; }
        public DbSet<Disponibilidade> Disponibilidades { get; set; }
        public DbSet<Paciente> Pacientes { get; set; }
        public DbSet<Agendamento> Agendamentos { get; set; }
        public DbSet<Atendimento> Atendimentos { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<MedicoEspecialidade>()
                .HasKey(me => new { me.MedicoId, me.EspecialidadeId });

            modelBuilder.Entity<MedicoEspecialidade>()
                .HasOne(me => me.Medico)
                .WithMany(m => m.MedicoEspecialidades)
                .HasForeignKey(me => me.MedicoId);

            modelBuilder.Entity<MedicoEspecialidade>()
                .HasOne(me => me.Especialidade)
                .WithMany(e => e.MedicoEspecialidades)
                .HasForeignKey(me => me.EspecialidadeId);
        }
    }
}
