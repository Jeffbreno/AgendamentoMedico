using AgendamentoMedico.API.Data;
using AgendamentoMedico.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Configuração básica da aplicação
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddAutoMapper(typeof(Program));

// Configuração do CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Configuração do Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v0.1", new OpenApiInfo
    {
        Title = "Agendamento Médico API",
        Version = "v0.1",
        Description = "API para gerenciamento de agendamentos médicos",
        Contact = new OpenApiContact
        {
            Name = "Desenvolvedor",
            Email = "jeffbreno@gmail.com"
        }
    });
});

// Configuração do DbContext com resiliência
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mysqlOptions =>
        {
            mysqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
            mysqlOptions.CommandTimeout(180); // Timeout aumentado para migrações
        });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableDetailedErrors();
        options.EnableSensitiveDataLogging();
    }
});

var app = builder.Build();

// Configuração do CORS
app.UseCors("AllowFrontend");

// Pipeline de middlewares
app.UseExceptionHandler("/error");

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v0.1/swagger.json", "Agendamento Médico v0.1");
        c.RoutePrefix = "swagger";
        c.ConfigObject.DisplayRequestDuration = true;
    });
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

// Health Check endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow
}));

// Migração e Seed de dados
await InitializeDatabase(app);

app.Run();

// Método para inicialização do banco de dados
async Task InitializeDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Aguardando o banco de dados ficar disponível...");
        await WaitForDbReady(context, logger);

        logger.LogInformation("Aplicando migrações...");
        await context.Database.MigrateAsync();

        if (!context.Convenios.Any())
        {
            logger.LogInformation("Iniciando seed de dados...");
            await SeedInitialData(context);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Erro durante a inicialização do banco de dados");
        throw;
    }
}

async Task WaitForDbReady(ApplicationDbContext context, ILogger logger, int maxAttempts = 10)
{
    for (int i = 0; i < maxAttempts; i++)
    {
        try
        {
            if (await context.Database.CanConnectAsync())
                return;
        }
        catch (Exception ex)
        {
            logger.LogWarning("Tentativa {Attempt}/{MaxAttempts} falhou: {Message}",
                i + 1, maxAttempts, ex.Message);
        }

        await Task.Delay(5000);
    }
    throw new Exception("Não foi possível conectar ao banco de dados após várias tentativas");
}

async Task SeedInitialData(ApplicationDbContext context)
{
    // Convenios
    var convenios = new List<Convenio>
    {
        new() { Nome = "Unimed" },
        new() { Nome = "SulAmérica" },
        new() { Nome = "Bradesco Saúde" }
    };

    // Especialidades
    var especialidades = new List<Especialidade>
    {
        new() { Nome = "Cardiologia" },
        new() { Nome = "Dermatologia" },
        new() { Nome = "Ortopedia" }
    };

    await context.Convenios.AddRangeAsync(convenios);
    await context.Especialidades.AddRangeAsync(especialidades);
    await context.SaveChangesAsync();

    // Médicos
    var medico = new Medico
    {
        Nome = "Dr. João Silva",
        MedicoEspecialidades = especialidades
            .Select(e => new MedicoEspecialidade { Especialidade = e })
            .ToList()
    };
    await context.Medicos.AddAsync(medico);

    // Pacientes
    var paciente = new Paciente
    {
        Nome = "Maria Souza",
        Email = "maria@email.com",
        Telefone = "11999998888",
        Convenio = convenios.First()
    };
    await context.Pacientes.AddAsync(paciente);

    await context.SaveChangesAsync();
}