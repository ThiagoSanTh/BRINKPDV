using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioVenda : IRepositorioVenda
{
    private readonly PdvDbContext _contexto;

    public RepositorioVenda(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Venda>> ObterTodasAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Vendas
            .AsNoTracking()
            .Include(venda => venda.Vendedor)
            .OrderByDescending(venda => venda.CriadoEm)
            .ToListAsync(cancelamento);
    }

    public async Task<IReadOnlyList<Venda>> ObterDeHojeAsync(CancellationToken cancelamento = default)
    {
        var inicio = DateTime.UtcNow.Date;
        var fim = inicio.AddDays(1);

        return await ObterPorPeriodoAsync(inicio, fim, cancelamento);
    }

    public async Task<IReadOnlyList<Venda>> ObterPorPeriodoAsync(DateTime inicio, DateTime fim, CancellationToken cancelamento = default)
    {
        var inicioUtc = DateTime.SpecifyKind(inicio, DateTimeKind.Utc);
        var fimUtc = DateTime.SpecifyKind(fim, DateTimeKind.Utc);

        return await _contexto.Vendas
            .AsNoTracking()
            .Include(venda => venda.Vendedor)
            .Where(venda => venda.CriadoEm >= inicioUtc && venda.CriadoEm < fimUtc)
            .OrderByDescending(venda => venda.CriadoEm)
            .ToListAsync(cancelamento);
    }

    public async Task<Venda?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Vendas
            .AsNoTracking()
            .Include(venda => venda.Vendedor)
            .FirstOrDefaultAsync(venda => venda.Id == id, cancelamento);
    }

    public async Task<Venda> CriarAsync(Venda venda, CancellationToken cancelamento = default)
    {
        _contexto.Vendas.Add(venda);
        await _contexto.SaveChangesAsync(cancelamento);
        return venda;
    }
}
