# Estágio de build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar apenas os arquivos necessários para restaurar pacotes
COPY ["AgendamentoMedico.API.csproj", "./"]
RUN dotnet restore "AgendamentoMedico.API.csproj"

# Copiar todo o código e construir
COPY . .
WORKDIR "/src"
RUN dotnet build "AgendamentoMedico.API.csproj" -c Release -o /app/build

# Publicar a aplicação
RUN dotnet publish "AgendamentoMedico.API.csproj" -c Release -o /app/publish

# Estágio de runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5110
EXPOSE 5110
ENTRYPOINT ["dotnet", "AgendamentoMedico.API.dll"]