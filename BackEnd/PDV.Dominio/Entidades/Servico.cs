namespace PDV.Dominio.Entidades;

public class Servico
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal? PrecoPadrao { get; set; }
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
