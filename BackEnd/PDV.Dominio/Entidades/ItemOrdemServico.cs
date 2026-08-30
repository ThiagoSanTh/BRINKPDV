namespace PDV.Dominio.Entidades;

public class ItemOrdemServico
{
    public string? ProdutoId { get; set; }
    public string? ServicoId { get; set; }
    public string Tipo { get; set; } = TiposItemTransacional.Servico;
    public string Nome { get; set; } = string.Empty;
    public int Quantidade { get; set; } = 1;
    public decimal PrecoUnitario { get; set; }

    public decimal Total => PrecoUnitario * Quantidade;
}

public static class TiposItemTransacional
{
    public const string Produto = "produto";
    public const string Servico = "servico";

    public static bool EhValido(string tipo) => tipo is Produto or Servico;
}
