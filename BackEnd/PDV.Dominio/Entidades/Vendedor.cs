namespace PDV.Dominio.Entidades;

public class Vendedor
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public decimal Comissao { get; set; }
    public decimal TotalVendas { get; set; }
    public bool Ativo { get; set; } = true;
    public DateOnly DataEntrada { get; set; } = DateOnly.FromDateTime(DateTime.Today);
}
