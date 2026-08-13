using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioConfiguracaoLoja : IRepositorioConfiguracaoLoja
{
    private readonly PdvDbContext _contexto;

    public RepositorioConfiguracaoLoja(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<ConfiguracaoLoja?> ObterAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.ConfiguracoesLoja
            .AsNoTracking()
            .FirstOrDefaultAsync(cancelamento);
    }

    public async Task<ConfiguracaoLoja> SalvarAsync(ConfiguracaoLoja configuracao, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.ConfiguracoesLoja.FirstOrDefaultAsync(cancelamento);

        if (existente is null)
        {
            _contexto.ConfiguracoesLoja.Add(configuracao);
            await _contexto.SaveChangesAsync(cancelamento);
            return configuracao;
        }

        existente.NomeLoja = configuracao.NomeLoja;
        existente.LogoLoja = configuracao.LogoLoja;
        existente.TelefoneLoja = configuracao.TelefoneLoja;
        existente.EnderecoLoja = configuracao.EnderecoLoja;
        existente.RazaoSocial = configuracao.RazaoSocial;
        existente.Cnpj = configuracao.Cnpj;
        existente.Cidade = configuracao.Cidade;
        existente.Estado = configuracao.Estado;
        existente.Cep = configuracao.Cep;
        existente.ComprovanteIncluirLogo = configuracao.ComprovanteIncluirLogo;
        existente.ComprovanteCabecalho = configuracao.ComprovanteCabecalho;
        existente.ComprovanteRodape = configuracao.ComprovanteRodape;
        existente.ComprovanteMostrarDadosFiscais = configuracao.ComprovanteMostrarDadosFiscais;
        existente.ImpressoraNome = configuracao.ImpressoraNome;
        existente.ImpressoraModelo = configuracao.ImpressoraModelo;
        existente.ImpressoraLarguraPapel = configuracao.ImpressoraLarguraPapel;
        existente.ImpressoraCorteAutomatico = configuracao.ImpressoraCorteAutomatico;
        existente.AlertaEstoqueBaixo = configuracao.AlertaEstoqueBaixo;
        existente.SomFinalizacao = configuracao.SomFinalizacao;
        existente.ImpressaoAutomatica = configuracao.ImpressaoAutomatica;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }
}
