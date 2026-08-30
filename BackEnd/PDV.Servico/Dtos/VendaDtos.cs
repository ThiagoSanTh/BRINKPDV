namespace PDV.Servico.Dtos;

public record ItemVendaDto(
    string ProdutoId,
    string? ServicoId,
    string Tipo,
    string Nome,
    int Quantidade,
    decimal PrecoUnitario,
    decimal Desconto,
    decimal Total);

public record VendaDto(
    string Id,
    string? VendedorId,
    string? VendedorNome,
    decimal Subtotal,
    decimal DescontoTotal,
    decimal Total,
    string FormaPagamento,
    string? Observacao,
    DateTime CriadoEm,
    IReadOnlyList<ItemVendaDto> Itens);

public class ItemVendaEntradaDto
{
    public string? ProdutoId { get; set; }
    public string? ServicoId { get; set; }
    public string Tipo { get; set; } = "produto";
    public int Quantidade { get; set; }
    public decimal? PrecoUnitario { get; set; }
    public decimal Desconto { get; set; }
}

public class VendaEntradaDto
{
    public string? VendedorId { get; set; }
    public string FormaPagamento { get; set; } = string.Empty;
    public string? Observacao { get; set; }
    public List<ItemVendaEntradaDto> Itens { get; set; } = [];
}
