using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioOrdemServico
{
    Task<IReadOnlyList<OrdemServico>> ObterTodasAsync(
        string? busca = null,
        string? status = null,
        string? clienteId = null,
        CancellationToken cancelamento = default);

    Task<IReadOnlyList<OrdemServico>> ObterPorClienteAsync(string clienteId, CancellationToken cancelamento = default);

    Task<OrdemServico?> ObterPorIdAsync(string id, CancellationToken cancelamento = default);

    Task<int> ContarAsync(CancellationToken cancelamento = default);

    Task<OrdemServico> CriarAsync(OrdemServico ordem, CancellationToken cancelamento = default);

    Task<OrdemServico?> AtualizarAsync(OrdemServico ordem, CancellationToken cancelamento = default);
}
