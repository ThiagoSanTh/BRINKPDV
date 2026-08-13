namespace PDV.Dominio.Entidades;

public class Venda
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string? VendedorId { get; set; }
    public decimal Total { get; set; }
    public string FormaPagamento { get; set; } = FormasPagamento.Dinheiro;
    public List<ItemVenda> Itens { get; set; } = [];
    public string? Observacao { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public Vendedor? Vendedor { get; set; }

    public decimal Subtotal => Itens.Sum(item => item.Subtotal);

    public decimal DescontoTotal => Itens.Sum(item => item.Desconto);

    public decimal CalcularTotal() => Math.Max(0, Subtotal - DescontoTotal);
}

public static class FormasPagamento
{
    public const string Dinheiro = "Dinheiro";
    public const string Credito = "Crédito";
    public const string Debito = "Débito";
    public const string Pix = "PIX";

    public static readonly string[] Todas =
    [
        Dinheiro,
        Credito,
        Debito,
        Pix,
    ];

    public static bool EhValida(string formaPagamento) => Todas.Contains(formaPagamento);
}
