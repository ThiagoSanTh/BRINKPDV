using Microsoft.EntityFrameworkCore;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Infraestrutura.Contexto;

namespace PDV.Repositorio;

public class RepositorioProduto : IRepositorioProduto
{
    private readonly PdvDbContext _contexto;

    public RepositorioProduto(PdvDbContext contexto)
    {
        _contexto = contexto;
    }

    public async Task<IReadOnlyList<Produto>> ObterTodosAsync(CancellationToken cancelamento = default)
    {
        return await _contexto.Produtos
            .AsNoTracking()
            .OrderBy(produto => produto.Nome)
            .ToListAsync(cancelamento);
    }

    public async Task<IReadOnlyList<Produto>> ObterPorCategoriaAsync(string categoria, CancellationToken cancelamento = default)
    {
        var normalizada = categoria.Trim().ToLower();

        return await _contexto.Produtos
            .AsNoTracking()
            .Where(produto => produto.Categoria.ToLower() == normalizada)
            .OrderBy(produto => produto.Nome)
            .ToListAsync(cancelamento);
    }

    public async Task<Produto?> ObterPorIdAsync(string id, CancellationToken cancelamento = default)
    {
        return await _contexto.Produtos.FirstOrDefaultAsync(produto => produto.Id == id, cancelamento);
    }

    public async Task<Produto?> ObterPorSkuAsync(string sku, CancellationToken cancelamento = default)
    {
        return await _contexto.Produtos.FirstOrDefaultAsync(produto => produto.Sku == sku, cancelamento);
    }

    public async Task<Produto> CriarAsync(Produto produto, CancellationToken cancelamento = default)
    {
        _contexto.Produtos.Add(produto);
        await _contexto.SaveChangesAsync(cancelamento);
        return produto;
    }

    public async Task<Produto?> AtualizarAsync(Produto produto, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Produtos.FirstOrDefaultAsync(item => item.Id == produto.Id, cancelamento);

        if (existente is null)
        {
            return null;
        }

        existente.Sku = produto.Sku;
        existente.Nome = produto.Nome;
        existente.Categoria = produto.Categoria;
        existente.Preco = produto.Preco;
        existente.PrecoCusto = produto.PrecoCusto;
        existente.Estoque = produto.Estoque;
        existente.CodigoBarras = produto.CodigoBarras;
        existente.Imagem = produto.Imagem;

        await _contexto.SaveChangesAsync(cancelamento);
        return existente;
    }

    public async Task<int> RenomearCategoriaAsync(
        string categoriaAtual,
        string novaCategoria,
        CancellationToken cancelamento = default)
    {
        var atualNormalizada = categoriaAtual.Trim().ToLower();
        var produtos = await _contexto.Produtos
            .Where(produto => produto.Categoria.ToLower() == atualNormalizada)
            .ToListAsync(cancelamento);

        foreach (var produto in produtos)
        {
            produto.Categoria = novaCategoria;
        }

        await _contexto.SaveChangesAsync(cancelamento);
        return produtos.Count;
    }

    public async Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        var existente = await _contexto.Produtos.FirstOrDefaultAsync(produto => produto.Id == id, cancelamento);

        if (existente is null)
        {
            return false;
        }

        _contexto.Produtos.Remove(existente);
        await _contexto.SaveChangesAsync(cancelamento);
        return true;
    }
}
