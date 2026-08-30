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

    public async Task<IReadOnlyList<ServicoDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var servicos = await _repositorio.ObterTodosAsync(cancelamento);
        return servicos.Select(servico => servico.ParaDto()).ToList();
    }

    public async Task<ServicoDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var servico = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return servico?.ParaDto();
    }

    public async Task<ServicoDto> CriarAsync(ServicoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var existente = await _repositorio.ObterPorNomeAsync(entrada.Nome, cancelamento);
        if (existente is not null)
        {
            throw new RegraNegocioException("Já existe um serviço com esse nome.");
        }

        var servico = new Servico
        {
            Nome = entrada.Nome.Trim(),
            Descricao = string.IsNullOrWhiteSpace(entrada.Descricao) ? null : entrada.Descricao.Trim(),
            PrecoPadrao = entrada.PrecoPadrao,
            Ativo = entrada.Ativo,
            CriadoEm = DateTime.UtcNow,
        };

        var criado = await _repositorio.CriarAsync(servico, cancelamento);
        return criado.ParaDto();
    }

    public async Task<ServicoDto?> AtualizarAsync(string id, ServicoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var comMesmoNome = await _repositorio.ObterPorNomeAsync(entrada.Nome, cancelamento);
        if (comMesmoNome is not null && comMesmoNome.Id != id)
        {
            throw new RegraNegocioException("Já existe um serviço com esse nome.");
        }

        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);
        if (existente is null)
        {
            return null;
        }

        existente.Nome = entrada.Nome.Trim();
        existente.Descricao = string.IsNullOrWhiteSpace(entrada.Descricao) ? null : entrada.Descricao.Trim();
        existente.PrecoPadrao = entrada.PrecoPadrao;
        existente.Ativo = entrada.Ativo;

        var atualizado = await _repositorio.AtualizarAsync(existente, cancelamento);
        return atualizado?.ParaDto();
    }

    public Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return _repositorio.RemoverAsync(id, cancelamento);
    }

    private static void Validar(ServicoEntradaDto entrada)
    {
        if (string.IsNullOrWhiteSpace(entrada.Nome))
        {
            throw new RegraNegocioException("Informe o nome do serviço.");
        }

        if (entrada.Nome.Trim().Length > 160)
        {
            throw new RegraNegocioException("O nome do serviço deve ter no máximo 160 caracteres.");
        }

        if (entrada.PrecoPadrao is < 0)
        {
            throw new RegraNegocioException("O preço padrão do serviço não pode ser negativo.");
        }
    }
}
