using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioProduto
{
    Task<IReadOnlyList<Produto>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<IReadOnlyList<Produto>> ObterPorCategoriaAsync(string categoria, CancellationToken cancelamento = default);

    Task<IReadOnlyList<(string Nome, int Quantidade)>> ListarCategoriasAsync(CancellationToken cancelamento = default);

    Task<int> RenomearCategoriaAsync(string nomeAtual, string nomeNovo, CancellationToken cancelamento = default);

    Task<Produto?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Produto?> ObterPorSkuAsync(string sku, CancellationToken cancelamento = default);

    Task<Produto> CriarAsync(Produto produto, CancellationToken cancelamento = default);

    Task<Produto?> AtualizarAsync(Produto produto, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
