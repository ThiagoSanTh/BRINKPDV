namespace PDV.Servico.Dtos;

public record ServicoDto(
    string Id,
    string Nome,
    string? Descricao,
    decimal? PrecoPadrao,
    bool Ativo,
    DateTime CriadoEm);

public class ServicoEntradaDto
{
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public decimal? PrecoPadrao { get; set; }
    public bool Ativo { get; set; } = true;
}
