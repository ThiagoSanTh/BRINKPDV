namespace PDV.Servico.Dtos;

public record BackupResumoDto(
    string Format,
    int Version,
    DateTime CreatedAt,
    string? StoreName,
    Dictionary<string, int> Records,
    bool Compativel,
    string? Mensagem);

public record RestaurarBackupResultadoDto(
    bool Sucesso,
    string Mensagem,
    Dictionary<string, int> Records,
    string? BackupPreventivoBase64);
