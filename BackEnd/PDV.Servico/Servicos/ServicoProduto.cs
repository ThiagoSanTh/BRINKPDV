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

    public async Task<IReadOnlyList<ProdutoDto>> ListarAsync(string? categoria = null, CancellationToken cancelamento = default)
    {
        var produtos = string.IsNullOrWhiteSpace(categoria)
            ? await _repositorio.ObterTodosAsync(cancelamento)
            : await _repositorio.ObterPorCategoriaAsync(categoria.Trim(), cancelamento);

        return produtos.Select(produto => produto.ParaDto()).ToList();
    }

    public async Task<IReadOnlyList<CategoriaResumoDto>> ListarCategoriasAsync(CancellationToken cancelamento = default)
    {
        var categorias = await _repositorio.ListarCategoriasAsync(cancelamento);
        return categorias
            .Select(categoria => new CategoriaResumoDto(categoria.Nome, categoria.Quantidade))
            .ToList();
    }

    public async Task<RenomearCategoriaResultadoDto> RenomearCategoriaAsync(
        RenomearCategoriaDto entrada,
        CancellationToken cancelamento = default)
    {
        if (string.IsNullOrWhiteSpace(entrada.NomeAtual))
        {
            throw new RegraNegocioException("Informe o nome atual da categoria.");
        }

        if (string.IsNullOrWhiteSpace(entrada.NomeNovo))
        {
            throw new RegraNegocioException("Informe o novo nome da categoria.");
        }

        var nomeAtual = entrada.NomeAtual.Trim();
        var nomeNovo = entrada.NomeNovo.Trim();

        if (string.Equals(nomeAtual, nomeNovo, StringComparison.OrdinalIgnoreCase))
        {
            throw new RegraNegocioException("O novo nome deve ser diferente do nome atual.");
        }

        var categorias = await _repositorio.ListarCategoriasAsync(cancelamento);
        var existeAtual = categorias.Any(categoria =>
            string.Equals(categoria.Nome, nomeAtual, StringComparison.OrdinalIgnoreCase));

        if (!existeAtual)
        {
            throw new RecursoNaoEncontradoException($"Categoria '{nomeAtual}' não encontrada.");
        }

        var duplicada = categorias.Any(categoria =>
            string.Equals(categoria.Nome, nomeNovo, StringComparison.OrdinalIgnoreCase));

        if (duplicada)
        {
            throw new RegraNegocioException($"Já existe uma categoria com o nome '{nomeNovo}'.");
        }

        var categoriaReal = categorias
            .First(categoria => string.Equals(categoria.Nome, nomeAtual, StringComparison.OrdinalIgnoreCase))
            .Nome;

        var atualizados = await _repositorio.RenomearCategoriaAsync(categoriaReal, nomeNovo, cancelamento);
        return new RenomearCategoriaResultadoDto(categoriaReal, nomeNovo, atualizados);
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
