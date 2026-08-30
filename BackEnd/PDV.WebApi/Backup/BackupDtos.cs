namespace PDV.WebApi.Backup;

public record ManifestBackupDto(
    string Format,
    int Version,
    DateTime CreatedAt,
    string ApplicationVersion,
    string? StoreId,
    string StoreName,
    IReadOnlyDictionary<string, int> Records);

public record ResumoBackupDto(
    ManifestBackupDto Manifest,
    string FileName);

public record ResultadoRestoreDto(
    ManifestBackupDto Manifest,
    string? PreventiveBackupFileName,
    string Mensagem);
