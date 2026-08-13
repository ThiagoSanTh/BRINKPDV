using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoVendedor : IServicoVendedor
{
    private readonly IRepositorioVendedor _repositorio;

    public ServicoVendedor(IRepositorioVendedor repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IReadOnlyList<VendedorDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var vendedores = await _repositorio.ObterTodosAsync(cancelamento);
        return vendedores.Select(vendedor => vendedor.ParaDto()).ToList();
    }

    public async Task<VendedorDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var vendedor = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return vendedor?.ParaDto();
    }

    public async Task<VendedorDto> CriarAsync(VendedorEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var vendedor = new Vendedor
        {
            Nome = entrada.Nome.Trim(),
            Email = entrada.Email.Trim(),
            Telefone = entrada.Telefone.Trim(),
            Comissao = entrada.Comissao,
            Ativo = entrada.Ativo,
            DataEntrada = entrada.DataEntrada ?? DateOnly.FromDateTime(DateTime.Today),
        };

        var criado = await _repositorio.CriarAsync(vendedor, cancelamento);
        return criado.ParaDto();
    }

    public async Task<VendedorDto?> AtualizarAsync(string id, VendedorEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var existente = await _repositorio.ObterPorIdAsync(id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.Nome = entrada.Nome.Trim();
        existente.Email = entrada.Email.Trim();
        existente.Telefone = entrada.Telefone.Trim();
        existente.Comissao = entrada.Comissao;
        existente.Ativo = entrada.Ativo;
        existente.DataEntrada = entrada.DataEntrada ?? existente.DataEntrada;

        var atualizado = await _repositorio.AtualizarAsync(existente, cancelamento);
        return atualizado?.ParaDto();
    }

    public Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return _repositorio.RemoverAsync(id, cancelamento);
    }

    private static void Validar(VendedorEntradaDto entrada)
    {
        if (string.IsNullOrWhiteSpace(entrada.Nome))
        {
            throw new RegraNegocioException("Informe o nome do vendedor.");
        }

        if (string.IsNullOrWhiteSpace(entrada.Email))
        {
            throw new RegraNegocioException("Informe o e-mail do vendedor.");
        }

        if (entrada.Comissao < 0 || entrada.Comissao > 100)
        {
            throw new RegraNegocioException("A comissão deve ficar entre 0 e 100.");
        }
    }
}
