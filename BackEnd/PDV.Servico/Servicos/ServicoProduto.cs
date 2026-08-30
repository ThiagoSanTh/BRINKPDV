using PDV.Dominio.Entidades;
using PDV.Dominio.Excecoes;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;
using PDV.Servico.Mapeamentos;

namespace PDV.Servico.Servicos;

public class ServicoProduto : IServicoProduto
{
    private readonly IRepositorioProduto _repositorio;

    public ServicoProduto(IRepositorioProduto repositorio)
    {
        _repositorio = repositorio;
    }

    public async Task<IReadOnlyList<ProdutoDto>> ListarAsync(CancellationToken cancelamento = default)
    {
        var produtos = await _repositorio.ObterTodosAsync(cancelamento);
        return produtos.Select(produto => produto.ParaDto()).ToList();
    }

    public async Task<IReadOnlyList<CategoriaProdutoDto>> ListarCategoriasAsync(CancellationToken cancelamento = default)
    {
        var produtos = await _repositorio.ObterTodosAsync(cancelamento);
        return produtos
            .GroupBy(produto => produto.Categoria.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(grupo =>
            {
                var itens = grupo.ToList();
                return new CategoriaProdutoDto(
                    itens[0].Categoria.Trim(),
                    itens.Count,
                    itens.Sum(produto => produto.Estoque),
                    itens.Sum(produto => produto.Preco * produto.Estoque));
            })
            .OrderByDescending(categoria => categoria.Quantidade)
            .ThenBy(categoria => categoria.Nome)
            .ToList();
    }

    public async Task<IReadOnlyList<ProdutoDto>> ListarPorCategoriaAsync(
        string categoria,
        CancellationToken cancelamento = default)
    {
        if (string.IsNullOrWhiteSpace(categoria))
        {
            throw new RegraNegocioException("Informe a categoria.");
        }

        var produtos = await _repositorio.ObterPorCategoriaAsync(categoria, cancelamento);
        return produtos.Select(produto => produto.ParaDto()).ToList();
    }

    public async Task<ProdutoDto?> ObterAsync(string id, CancellationToken cancelamento = default)
    {
        var produto = await _repositorio.ObterPorIdAsync(id, cancelamento);
        return produto?.ParaDto();
    }

    public async Task<ProdutoDto> CriarAsync(ProdutoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var existente = await _repositorio.ObterPorSkuAsync(entrada.Sku, cancelamento);

        if (existente is not null)
        {
            throw new RegraNegocioException($"Já existe um produto com o SKU {entrada.Sku}.");
        }

        var produto = new Produto
        {
            Sku = entrada.Sku.Trim(),
            Nome = entrada.Nome.Trim(),
            Categoria = entrada.Categoria.Trim(),
            Preco = entrada.Preco,
            PrecoCusto = entrada.PrecoCusto,
            Estoque = entrada.Estoque,
            CodigoBarras = entrada.CodigoBarras,
            Imagem = entrada.Imagem,
        };

        var criado = await _repositorio.CriarAsync(produto, cancelamento);
        return criado.ParaDto();
    }

    public async Task<ProdutoDto?> AtualizarAsync(string id, ProdutoEntradaDto entrada, CancellationToken cancelamento = default)
    {
        Validar(entrada);

        var comMesmoSku = await _repositorio.ObterPorSkuAsync(entrada.Sku, cancelamento);

        if (comMesmoSku is not null && comMesmoSku.Id != id)
        {
            throw new RegraNegocioException($"Já existe um produto com o SKU {entrada.Sku}.");
        }

        var produto = new Produto
        {
            Id = id,
            Sku = entrada.Sku.Trim(),
            Nome = entrada.Nome.Trim(),
            Categoria = entrada.Categoria.Trim(),
            Preco = entrada.Preco,
            PrecoCusto = entrada.PrecoCusto,
            Estoque = entrada.Estoque,
            CodigoBarras = entrada.CodigoBarras,
            Imagem = entrada.Imagem,
        };

        var atualizado = await _repositorio.AtualizarAsync(produto, cancelamento);
        return atualizado?.ParaDto();
    }

    public async Task<CategoriaProdutoDto> AtualizarCategoriaAsync(
        string categoriaAtual,
        CategoriaAtualizacaoDto entrada,
        CancellationToken cancelamento = default)
    {
        if (string.IsNullOrWhiteSpace(categoriaAtual))
        {
            throw new RegraNegocioException("Informe a categoria atual.");
        }

        var novoNome = entrada.Nome.Trim();

        if (string.IsNullOrWhiteSpace(novoNome))
        {
            throw new RegraNegocioException("Informe o novo nome da categoria.");
        }

        if (novoNome.Length > 120)
        {
            throw new RegraNegocioException("O nome da categoria deve ter no máximo 120 caracteres.");
        }

        var categorias = await ListarCategoriasAsync(cancelamento);
        var atual = categorias.FirstOrDefault(
            categoria => string.Equals(categoria.Nome, categoriaAtual.Trim(), StringComparison.OrdinalIgnoreCase));

        if (atual is null)
        {
            throw new RecursoNaoEncontradoException("Categoria não encontrada.");
        }

        var duplicada = categorias.Any(
            categoria => !string.Equals(categoria.Nome, categoriaAtual.Trim(), StringComparison.OrdinalIgnoreCase)
                && string.Equals(categoria.Nome, novoNome, StringComparison.OrdinalIgnoreCase));

        if (duplicada)
        {
            throw new RegraNegocioException("Já existe uma categoria com esse nome.");
        }

        await _repositorio.RenomearCategoriaAsync(categoriaAtual, novoNome, cancelamento);

        var produtos = await _repositorio.ObterPorCategoriaAsync(novoNome, cancelamento);
        return new CategoriaProdutoDto(
            novoNome,
            produtos.Count,
            produtos.Sum(produto => produto.Estoque),
            produtos.Sum(produto => produto.Preco * produto.Estoque));
    }

    public Task<bool> RemoverAsync(string id, CancellationToken cancelamento = default)
    {
        return _repositorio.RemoverAsync(id, cancelamento);
    }

    private static void Validar(ProdutoEntradaDto entrada)
    {
        if (string.IsNullOrWhiteSpace(entrada.Sku))
        {
            throw new RegraNegocioException("Informe o SKU do produto.");
        }

        if (string.IsNullOrWhiteSpace(entrada.Nome))
        {
            throw new RegraNegocioException("Informe o nome do produto.");
        }

        if (string.IsNullOrWhiteSpace(entrada.Categoria))
        {
            throw new RegraNegocioException("Informe a categoria do produto.");
        }

        if (entrada.Preco <= 0)
        {
            throw new RegraNegocioException("O preço do produto deve ser maior que zero.");
        }

        if (entrada.Estoque < 0)
        {
            throw new RegraNegocioException("O estoque não pode ser negativo.");
        }
    }
}
