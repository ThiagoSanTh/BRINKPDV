namespace PDV.Dominio.Entidades;

public class Produto
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Sku { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    public decimal? PrecoCusto { get; set; }
    public int Estoque { get; set; }
    public string? CodigoBarras { get; set; }
    public string? Imagem { get; set; }

    public bool EstoqueBaixo => Estoque < 10;
}
