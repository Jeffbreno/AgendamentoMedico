# Etapa de build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

COPY ./AgendamentoMedico.API.csproj ./
RUN dotnet restore

COPY . ./
RUN dotnet publish -c Release -o out

# Etapa de runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://+:5110
EXPOSE 5110
ENTRYPOINT ["dotnet", "AgendamentoMedico.API.dll"]
