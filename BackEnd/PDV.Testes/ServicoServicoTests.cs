using PDV.Dominio.Excecoes;
using PDV.Repositorio;
using PDV.Servico.Dtos;
using PDV.Servico.Servicos;

namespace PDV.Testes;

public class ServicoServicoTests
{
    [Fact]
    public async Task CriarAsync_SemPrecoPadrao_DevePermitir()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        var repositorio = new RepositorioServico(contexto);
        var servico = new ServicoServico(repositorio);

        var resultado = await servico.CriarAsync(new ServicoCatalogoEntradaDto
        {
            Nome = "Formatação",
            Descricao = "Limpeza e reinstalação",
        });

        Assert.Null(resultado.PrecoPadrao);
        Assert.Equal("Formatação", resultado.Nome);
    }

    [Fact]
    public async Task CriarAsync_ComPrecoOpcional_DevePersistir()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        var repositorio = new RepositorioServico(contexto);
        var servico = new ServicoServico(repositorio);

        var resultado = await servico.CriarAsync(new ServicoCatalogoEntradaDto
        {
            Nome = "Troca de tela",
            PrecoPadrao = 199.90m,
        });

        Assert.Equal(199.90m, resultado.PrecoPadrao);
    }

    [Fact]
    public async Task CriarAsync_NomeVazio_DeveRejeitar()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        var repositorio = new RepositorioServico(contexto);
        var servico = new ServicoServico(repositorio);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            servico.CriarAsync(new ServicoCatalogoEntradaDto { Nome = "   " }));
    }
}
