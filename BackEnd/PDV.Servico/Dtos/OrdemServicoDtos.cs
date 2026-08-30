namespace PDV.Servico.Dtos;

public record ClienteDto(
    string Id,
    string Nome,
    string Telefone,
    string? Observacoes,
    DateTime CriadoEm);

public class ClienteEntradaDto
{
    public string Nome { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string? Observacoes { get; set; }
}

public record ResultadoWhatsAppDto(
    bool Enviado,
    bool Configurado,
    string? UrlWhatsApp,
    string Mensagem);

public record OrdemServicoDto(
    string Id,
    string Numero,
    string? ClienteId,
    string Cliente,
    string ContatoCliente,
    string TipoAparelho,
    string Marca,
    string Modelo,
    string Aparelho,
    string EstadoAparelho,
    string Problema,
    string Status,
    string Prioridade,
    decimal Valor,
    DateOnly Data,
    DateOnly Prazo,
    DateOnly? DataSaida,
    IReadOnlyList<ItemOrdemServicoDto> ItensServico,
    ResultadoWhatsAppDto? WhatsApp = null);

public class OrdemServicoEntradaDto
{
    public string? ClienteId { get; set; }
    public string? Cliente { get; set; }
    public string? ContatoCliente { get; set; }
    public string? TipoAparelho { get; set; }
    public string? Marca { get; set; }
    public string? Modelo { get; set; }
    public string? Aparelho { get; set; }
    public string? EstadoAparelho { get; set; }
    public string? Problema { get; set; }
    public string? Status { get; set; }
    public string? Prioridade { get; set; }
    public decimal Valor { get; set; }
    public List<ItemOrdemServicoEntradaDto>? ItensServico { get; set; }
    public DateOnly? Prazo { get; set; }
    public DateOnly? DataSaida { get; set; }
}
