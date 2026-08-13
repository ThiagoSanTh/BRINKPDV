namespace PDV.Servico.Dtos;

public record MovimentoCaixaDto(
    string Id,
    string Tipo,
    decimal Valor,
    string? Descricao,
    DateTime CriadoEm);

public record ResumoCaixaDto(
    decimal Entradas,
    decimal Saidas,
    decimal Saldo,
    IReadOnlyList<MovimentoCaixaDto> Movimentos);

public class MovimentoCaixaEntradaDto
{
    public string Tipo { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string? Descricao { get; set; }
}
