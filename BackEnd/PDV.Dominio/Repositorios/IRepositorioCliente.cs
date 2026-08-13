using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioCliente
{
    Task<IReadOnlyList<Cliente>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<Cliente?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Cliente?> ObterPorTelefoneAsync(string telefone, CancellationToken cancelamento = default);

    Task<Cliente> CriarAsync(Cliente cliente, CancellationToken cancelamento = default);

    Task<Cliente?> AtualizarAsync(Cliente cliente, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
