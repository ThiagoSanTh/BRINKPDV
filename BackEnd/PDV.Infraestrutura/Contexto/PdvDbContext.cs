using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;

namespace PDV.Infraestrutura.Contexto;

public class PdvDbContext : DbContext
{
    public PdvDbContext(DbContextOptions<PdvDbContext> opcoes) : base(opcoes)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();

    public DbSet<Produto> Produtos => Set<Produto>();

    public DbSet<Vendedor> Vendedores => Set<Vendedor>();

    public DbSet<Venda> Vendas => Set<Venda>();

    public DbSet<Cliente> Clientes => Set<Cliente>();

    public DbSet<OrdemServico> OrdensServico => Set<OrdemServico>();

    public DbSet<ConfiguracaoLoja> ConfiguracoesLoja => Set<ConfiguracaoLoja>();

    public DbSet<MovimentoCaixa> MovimentosCaixa => Set<MovimentoCaixa>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(PdvDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
