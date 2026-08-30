using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoServico : IServicoServico
{
    private readonly IRepositorioServico _repositorio;

    public ServicoServico(IRepositorioServico repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IReadOnlyList<ServicoCatalogoDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var servicos = await _repositorio.ObterTodosAsync(cancelamento);
        return servicos.Select(servico => servico.ParaDto()).ToList();
    }

    public async Task<ServicoCatalogoDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var servico = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return servico?.ParaDto();
    }

    public async Task<ServicoCatalogoDto> CriarAsync(ServicoCatalogoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var existente = await _repositorio.ObterPorNomeAsync(entrada.Nome, cancelamento);

        if (existente is not null)
        {
            throw new RegraNegocioException($"Já existe um serviço com o nome '{entrada.Nome.Trim()}'.");
        }

        var servico = new ServicoCatalogo
        {
            Nome = entrada.Nome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(entrada.Descricao) ? null : entrada.Descricao.Trim(),
            PrecoPadrao = entrada.PrecoPadrao,
            Ativo = entrada.Ativo,
        };

        var criado = await _repositorio.CriarAsync(servico, cancelamento);
        return criado.ParaDto();
    }

    public async Task<ServicoCatalogoDto?> AtualizarAsync(
        string id,
        ServicoCatalogoEntradaDto entrada,
        CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var comMesmoNome = await _repositorio.ObterPorNomeAsync(entrada.Nome, cancelamento);

        if (comMesmoNome is not null && comMesmoNome.Id != id)
        {
            throw new RegraNegocioException($"Já existe um serviço com o nome '{entrada.Nome.Trim()}'.");
        }

        var servico = new ServicoCatalogo
        {
            Id = id,
            Nome = entrada.Nome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(entrada.Descricao) ? null : entrada.Descricao.Trim(),
            PrecoPadrao = entrada.PrecoPadrao,
            Ativo = entrada.Ativo,
        };

        var atualizado = await _repositorio.AtualizarAsync(servico, cancelamento);
        return atualizado?.ParaDto();
    }

    public Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return _repositorio.RemoverAsync(id, cancelamento);
    }

    private static void Validar(ServicoCatalogoEntradaDto entrada)
    {
        if (string.IsNullOrWhiteSpace(entrada.Nome))
        {
            throw new RegraNegocioException("Informe o nome do serviço.");
        }

        if (entrada.PrecoPadrao is < 0)
        {
            throw new RegraNegocioException("O preço padrão não pode ser negativo.");
        }
    }
}
