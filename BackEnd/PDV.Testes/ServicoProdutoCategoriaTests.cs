using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Repositorio;
using PDV.Servico.Dtos;
using PDV.Servico.Servicos;

namespace PDV.Testes;

public class ServicoProdutoCategoriaTests
{
    [Fact]
    public async Task ListarAsync_ComCategoria_DeveFiltrarProdutos()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        contexto.Produtos.AddRange(
            new Produto { Sku = "A1", Nome = "Cabo USB", Categoria = "Cabos", Preco = 10, Estoque = 5 },
            new Produto { Sku = "B1", Nome = "Capa", Categoria = "Acessórios", Preco = 20, Estoque = 3 });
        await contexto.SaveChangesAsync();

        var repositorio = new RepositorioProduto(contexto);
        var servico = new ServicoProduto(repositorio);

        var resultado = await servico.ListarAsync("Cabos");

        Assert.Single(resultado);
        Assert.Equal("Cabo USB", resultado[0].Nome);
    }

    [Fact]
    public async Task RenomearCategoriaAsync_DeveAtualizarProdutos()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        contexto.Produtos.AddRange(
            new Produto { Sku = "A1", Nome = "Cabo USB", Categoria = "Cabos", Preco = 10, Estoque = 5 },
            new Produto { Sku = "A2", Nome = "Cabo HDMI", Categoria = "Cabos", Preco = 15, Estoque = 2 });
        await contexto.SaveChangesAsync();

        var repositorio = new RepositorioProduto(contexto);
        var servico = new ServicoProduto(repositorio);

        var resultado = await servico.RenomearCategoriaAsync(new RenomearCategoriaDto
        {
            NomeAtual = "Cabos",
            NomeNovo = "Conectores",
        });

        Assert.Equal(2, resultado.ProdutosAtualizados);
        Assert.Equal("Conectores", resultado.NomeNovo);

        var produtos = await servico.ListarAsync("Conectores");
        Assert.Equal(2, produtos.Count);
    }

    [Fact]
    public async Task RenomearCategoriaAsync_NomeDuplicado_DeveRejeitar()
    {
        await using var contexto = FabricaContextoTeste.Criar();
        contexto.Produtos.AddRange(
            new Produto { Sku = "A1", Nome = "Cabo USB", Categoria = "Cabos", Preco = 10, Estoque = 5 },
            new Produto { Sku = "B1", Nome = "Capa", Categoria = "Acessórios", Preco = 20, Estoque = 3 });
        await contexto.SaveChangesAsync();

        var repositorio = new RepositorioProduto(contexto);
        var servico = new ServicoProduto(repositorio);

        await Assert.ThrowsAsync<RegraNegocioException>(() =>
            servico.RenomearCategoriaAsync(new RenomearCategoriaDto
            {
                NomeAtual = "Cabos",
                NomeNovo = "acessórios",
            }));
    }
}
