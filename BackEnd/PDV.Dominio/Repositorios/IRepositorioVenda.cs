using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioVenda
{
    Task<IReadOnlyList<Venda>> ObterTodasAsync(CancellationToken cancelamento = default);

    Task<IReadOnlyList<Venda>> ObterDeHojeAsync(CancellationToken cancelamento = default);

    Task<IReadOnlyList<Venda>> ObterPorPeriodoAsync(DateTime inicio, DateTime fim, CancellationToken cancelamento = default);

    Task<Venda?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Venda> CriarAsync(Venda venda, CancellationToken cancelamento = default);
}
