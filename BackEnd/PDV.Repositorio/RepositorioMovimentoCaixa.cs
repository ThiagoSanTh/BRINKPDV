using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioMovimentoCaixa : IRepositorioMovimentoCaixa
{
    private readonly PdvDbContext _contexto;

    public RepositorioMovimentoCaixa(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<MovimentoCaixa>> ObterDeHojeAsync(CancellationToken cancelamento = default)
    {
        var inicio = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
        var fim = inicio.AddDays(1);

        return await _contexto.MovimentosCaixa
            .AsNoTracking()
            .Where(movimento => movimento.CriadoEm >= inicio && movimento.CriadoEm < fim)
            .OrderByDescending(movimento => movimento.CriadoEm)
            .ToListAsync(cancelamento);
    }

    public async Task<MovimentoCaixa> CriarAsync(MovimentoCaixa movimento, CancellationToken cancelamento = default)
    {
        _contexto.MovimentosCaixa.Add(movimento);
        await _contexto.SaveChangesAsync(cancelamento);
        return movimento;
    }
}
