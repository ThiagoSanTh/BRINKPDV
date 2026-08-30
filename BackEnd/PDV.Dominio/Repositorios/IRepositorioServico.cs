using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioServico
{
    Task<IReadOnlyList<ServicoCatalogo>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<ServicoCatalogo?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<ServicoCatalogo?> ObterPorNomeAsync(string nome, CancellationToken cancelamento = default);

    Task<ServicoCatalogo> CriarAsync(ServicoCatalogo servico, CancellationToken cancelamento = default);

    Task<ServicoCatalogo?> AtualizarAsync(ServicoCatalogo servico, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
