namespace PDV.Dominio.Entidades;

public class MovimentoCaixa
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Tipo { get; set; } = TiposMovimentoCaixa.Entrada;
    public decimal Valor { get; set; }
    public string? Descricao { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

public static class TiposMovimentoCaixa
{
    public const string Entrada = "entrada";
    public const string Saida = "saida";

    public static bool EhValido(string tipo) => tipo is Entrada or Saida;
}
