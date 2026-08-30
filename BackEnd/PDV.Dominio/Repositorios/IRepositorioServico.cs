using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioServico
{
    Task<IReadOnlyList<Servico>> ObterTodosAsync(CancellationToken cancelamento = default);

    Task<Servico?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<Servico?> ObterPorNomeAsync(string nome, CancellationToken cancelamento = default);

    Task<Servico> CriarAsync(Servico servico, CancellationToken cancelamento = default);

    Task<Servico?> AtualizarAsync(Servico servico, CancellationToken cancelamento = default);

    Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default);
}
