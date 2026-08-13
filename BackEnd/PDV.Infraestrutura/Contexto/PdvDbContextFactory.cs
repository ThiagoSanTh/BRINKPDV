using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PDV.Infraestrutura.Contexto;

public class PdvDbContextFactory : IDesignTimeDbContextFactory<PdvDbContext>
{
    public PdvDbContext CreateDbContext(string[] args)
    {
        var conexao = Environment.GetEnvironmentVariable("PDV_POSTGRES");

        if (string.IsNullOrWhiteSpace(conexao))
        {
            throw new InvalidOperationException(
                "Defina a variável de ambiente PDV_POSTGRES com a connection string do Supabase antes de rodar comandos do EF Core.");
        }

        var opcoes = new DbContextOptionsBuilder<PdvDbContext>()
            .UseNpgsql(conexao)
            .Options;

        return new PdvDbContext(opcoes);
    }
}
