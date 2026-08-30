namespace PDV.Dominio.Entidades;

public class ItemOrdemServico
{
    public string ServicoId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal ValorCobrado { get; set; }

    public decimal Total => ValorCobrado;
}
