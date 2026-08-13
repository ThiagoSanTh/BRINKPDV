using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioVendedor
{
    Task<IReadOnlyList<Vendedor>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<Vendedor?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Vendedor> CriarAsync(Vendedor vendedor, CancellationToken cancelamento = default);

    Task<Vendedor?> AtualizarAsync(Vendedor vendedor, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
