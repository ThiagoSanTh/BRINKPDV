namespace PDV.Servico.Dtos;

public record ProdutoDto(
    string Id,
    string Sku,
    string Nome,
    string Categoria,
    decimal Preco,
    decimal? PrecoCusto,
    int Estoque,
    string? CodigoBarras,
    string? Imagem,
    bool EstoqueBaixo);

public record CategoriaProdutoDto(
    string Nome,
    int Quantidade,
    int EstoqueTotal,
    decimal ValorTotal);

public class CategoriaAtualizacaoDto
{
    public string Nome { get; set; } = string.Empty;
}

public class ProdutoEntradaDto
{
    public string Sku { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public decimal? PrecoCusto { get; set; }
    public int Estoque { get; set; }
    public string? CodigoBarras { get; set; }
    public string? Imagem { get; set; }
}
