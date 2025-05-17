using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(connectionString,
        ServerVersion.AutoDetect(connectionString),
        mysqlOptions =>
        {
            mysqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
        })
    .EnableDetailedErrors()
    .EnableSensitiveDataLogging();
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Garante que o banco está criado
    context.Database.EnsureCreated();

    // Verifica se já tem dados
    if (!context.Convenios.Any())
    {
        var convenio1 = new Convenio { Nome = "Unimed" };
        var convenio2 = new Convenio { Nome = "SulAmérica" };
        context.Convenios.AddRange(convenio1, convenio2);

        var especialidade1 = new Especialidade { Nome = "Cardiologia" };
        var especialidade2 = new Especialidade { Nome = "Dermatologia" };
        context.Especialidades.AddRange(especialidade1, especialidade2);

        var medico = new Medico
        {
            Nome = "Dr. João",
            MedicoEspecialidades = new List<MedicoEspecialidade>
            {
                new MedicoEspecialidade { Especialidade = especialidade1 },
                new MedicoEspecialidade { Especialidade = especialidade2 }
            }
        };
        context.Medicos.Add(medico);

        var paciente = new Paciente
        {
            Nome = "Maria Souza",
            Email = "maria@email.com",
            Telefone = "11999998888",
            Convenio = convenio1
        };
        context.Pacientes.Add(paciente);

        await context.SaveChangesAsync();
    }
}


app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
