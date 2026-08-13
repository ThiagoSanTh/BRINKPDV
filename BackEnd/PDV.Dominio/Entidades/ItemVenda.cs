namespace PDV.Dominio.Entidades;

public class ItemVenda
{
    public string ProdutoId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal PrecoUnitario { get; set; }
    public decimal Desconto { get; set; }

    public decimal Subtotal => PrecoUnitario * Quantidade;

    public decimal Total => Math.Max(0, Subtotal - Desconto);
}
