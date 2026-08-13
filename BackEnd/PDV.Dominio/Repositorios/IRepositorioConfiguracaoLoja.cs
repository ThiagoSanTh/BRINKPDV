using PDV.Dominio.Entidades;

namespace PDV.Dominio.Repositorios;

public interface IRepositorioConfiguracaoLoja
{
    Task<ConfiguracaoLoja?> ObterAsync(CancellationToken cancelamento = default);

    Task<ConfiguracaoLoja> SalvarAsync(ConfiguracaoLoja configuracao, CancellationToken cancelamento = default);
}
