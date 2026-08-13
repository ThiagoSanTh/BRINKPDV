namespace PDV.Dominio.Entidades;

public class Cliente
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Observacoes { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public ICollection<OrdemServico> Ordens { get; set; } = new List<OrdemServico>();
}
