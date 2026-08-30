using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Infraestrutura.Contexto;

namespace PDV.Testes;

public static class FabricaContextoTeste
{
    public static PdvDbContext Criar(string? nomeBanco = null)
    {
        var opcoes = new DbContextOptionsBuilder<PdvDbContext>()
            .UseInMemoryDatabase(nomeBanco ?? Guid.NewGuid().ToString())
            .Options;

        return new PdvDbContext(opcoes);
    }
}
