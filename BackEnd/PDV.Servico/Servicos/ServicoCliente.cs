using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoCliente : IServicoCliente
{
    private readonly IRepositorioCliente _repositorio;

    public ServicoCliente(IRepositorioCliente repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IReadOnlyList<ClienteDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var clientes = await _repositorio.ObterTodosAsync(cancelamento);
        return clientes.Select(cliente => cliente.ParaDto()).ToList();
    }

    public async Task<ClienteDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var cliente = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return cliente?.ParaDto();
    }

    public async Task<ClienteDto> CriarAsync(ClienteEntradaDto entrada, CancellationToken cancelamento = default)
    {
        var cliente = await MontarAsync(entrada, null, cancelamento);
        var criado = await _repositorio.CriarAsync(cliente, cancelamento);
        return criado.ParaDto();
    }

    public async Task<ClienteDto?> AtualizarAsync(string id, ClienteEntradaDto entrada, CancellationToken cancelamento = default)
    {
        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        var atualizado = await MontarAsync(entrada, existente, cancelamento);
        var salvo = await _repositorio.AtualizarAsync(atualizado, cancelamento);
        return salvo?.ParaDto();
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return await _repositorio.RemoverAsync(id, cancelamento);
    }

    private async Task<Cliente> MontarAsync(
        ClienteEntradaDto entrada,
        Cliente? existente,
        CancellationToken cancelamento)
    {
        if (string.IsNullOrWhiteSpace(entrada.Nome))
        {
            throw new RegraNegocioException("Informe o nome do cliente.");
        }

        if (!TelefoneCliente.EhValido(entrada.Telefone))
        {
            throw new RegraNegocioException("Informe um telefone válido com DDD.");
        }

        var telefone = TelefoneCliente.SomenteDigitos(entrada.Telefone);
        var outro = await _repositorio.ObterPorTelefoneAsync(telefone, cancelamento);

        if (outro is not null && outro.Id != existente?.Id)
        {
            throw new RegraNegocioException("Já existe um cliente com esse telefone.");
        }

        return new Cliente
        {
            Id = existente?.Id ?? Guid.NewGuid().ToString(),
            Nome = entrada.Nome.Trim(),
            Telefone = telefone,
            Observacoes = string.IsNullOrWhiteSpace(entrada.Observacoes) ? null : entrada.Observacoes.Trim(),
            CriadoEm = existente?.CriadoEm ?? DateTime.UtcNow,
        };
    }
}
