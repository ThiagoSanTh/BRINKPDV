using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoCaixa : IServicoCaixa
{
    private readonly IRepositorioMovimentoCaixa _repositorio;

    public ServicoCaixa(IRepositorioMovimentoCaixa repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<ResumoCaixaDto> ObterResumoAsync(CancellationToken cancelamento = default)
    {
        var movimentos = await _repositorio.ObterDeHojeAsync(cancelamento);

        var entradas = movimentos
            .Where(movimento => movimento.Tipo == TiposMovimentoCaixa.Entrada)
            .Sum(movimento => movimento.Valor);

        var saidas = movimentos
            .Where(movimento => movimento.Tipo == TiposMovimentoCaixa.Saida)
            .Sum(movimento => movimento.Valor);

        return new ResumoCaixaDto(
            entradas,
            saidas,
            entradas - saidas,
            movimentos.Select(movimento => movimento.ParaDto()).ToList());
    }

    public async Task<MovimentoCaixaDto> RegistrarAsync(MovimentoCaixaEntradaDto entrada, CancellationToken cancelamento = default)
    {
        if (!TiposMovimentoCaixa.EhValido(entrada.Tipo))
        {
            throw new RegraNegocioException("O tipo do movimento deve ser entrada ou saida.");
        }

        if (entrada.Valor <= 0)
        {
            throw new RegraNegocioException("Digite um valor válido.");
        }

        var movimento = new MovimentoCaixa
        {
            Tipo = entrada.Tipo,
            Valor = entrada.Valor,
            Descricao = string.IsNullOrWhiteSpace(entrada.Descricao) ? null : entrada.Descricao.Trim(),
            CriadoEm = DateTime.UtcNow,
        };

        var criado = await _repositorio.CriarAsync(movimento, cancelamento);
        return criado.ParaDto();
    }
}
