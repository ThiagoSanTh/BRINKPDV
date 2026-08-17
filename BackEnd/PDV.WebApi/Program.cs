using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PDV.Infraestrutura.Contexto;
using PDV.WebApi.Configuracao;
using PDV.WebApi.Dados;
using PDV.WebApi.Middlewares;

var builder = WebApplication.CreateBuilder(args);

var conexao = ConexaoPostgres.Resolver(builder.Configuration) ?? string.Empty;

builder.Services.AddDbContext<PdvDbContext>(opcoes => opcoes.UseNpgsql(conexao));

builder.Services.Configure<OpcoesJwt>(builder.Configuration.GetSection(OpcoesJwt.Secao));

var opcoesJwt = builder.Configuration.GetSection(OpcoesJwt.Secao).Get<OpcoesJwt>() ?? new OpcoesJwt();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opcoes =>
    {
        opcoes.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = opcoesJwt.Emissor,
            ValidAudience = opcoesJwt.Audiencia,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opcoesJwt.Chave)),
        };
    });

builder.Services.AddAuthorization();
builder.Services.AdicionarRepositorios();
builder.Services.AdicionarServicosDeDominio();

builder.Services.AddCors(opcoes =>
{
    opcoes.AddDefaultPolicy(politica => politica
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opcoes =>
{
    opcoes.SwaggerDoc("v1", new OpenApiInfo { Title = "BRINKPDV API", Version = "v1" });

    opcoes.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
    });

    opcoes.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
            },
            Array.Empty<string>()
        },
    });
});

var app = builder.Build();

app.UseMiddleware<MiddlewareTratamentoErros>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/api/status", async (PdvDbContext contexto, CancellationToken cancelamento) =>
{
    var conectado = await contexto.Database.CanConnectAsync(cancelamento);

    return Results.Ok(new
    {
        api = "online",
        banco = conectado ? "conectado" : "indisponivel",
    });
});

if (string.IsNullOrWhiteSpace(conexao))
{
    app.Logger.LogWarning(
        "Connection string do Postgres não configurada. Defina PDV_POSTGRES com o Session pooler IPv4 do Supabase.");
}
else
{
    var host = ConexaoPostgres.ExtrairHost(conexao);
    app.Logger.LogInformation("Postgres configurado para o host {Host}", host ?? "(desconhecido)");

    if (ConexaoPostgres.PareceHostIpv6Somente(conexao))
    {
        app.Logger.LogWarning(
            "O host {Host} do Supabase é só IPv6. Use o Session pooler (aws-0-….pooler.supabase.com) em PDV_POSTGRES.",
            host);
    }

    try
    {
        await InicializadorBanco.PrepararAsync(app.Services, app.Logger);
    }
    catch (Exception excecao)
    {
        app.Logger.LogError(excecao, "Não foi possível preparar o banco de dados. A API sobe sem persistência funcional.");
    }
}

app.Run();
