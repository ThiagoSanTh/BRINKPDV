FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY BackEnd/ .
RUN dotnet restore PDV.sln
RUN dotnet publish PDV.WebApi/PDV.WebApi.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "dotnet PDV.WebApi.dll --urls http://0.0.0.0:${PORT:-8080}"]
