using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoConfiguracaoLoja : IServicoConfiguracaoLoja
{
    private readonly IRepositorioConfiguracaoLoja _repositorio;

    public ServicoConfiguracaoLoja(IRepositorioConfiguracaoLoja repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ConfiguracaoLojaDto> ObterAsync(CancellationToken cancelamento = default)
    {
        var configuracao = await _repositorio.ObterAsync(cancelamento);
        return (configuracao ?? new ConfiguracaoLoja()).ParaDto();
    }

    public async Task<ConfiguracaoLojaDto> SalvarAsync(ConfiguracaoLojaDto entrada, CancellationToken cancelamento = default)
    {
        var configuracao = await _repositorio.ObterAsync(cancelamento) ?? new ConfiguracaoLoja();
        entrada.AplicarEm(configuracao);

        var salva = await _repositorio.SalvarAsync(configuracao, cancelamento);
        return salva.ParaDto();
    }
}
