namespace PDV.Servico.Dtos;

public record VendedorDto(
    string Id,
    string Nome,
    string Email,
    string Telefone,
    decimal Comissao,
    decimal TotalVendas,
    bool Ativo,
    DateOnly DataEntrada);

public class VendedorEntradaDto
{
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public decimal Comissao { get; set; }
    public bool Ativo { get; set; } = true;
    public DateOnly? DataEntrada { get; set; }
}
