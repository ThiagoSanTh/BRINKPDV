namespace PDV.Servico.Dtos;

public record UsuarioDto(
    string Id,
    string NomeUsuario,
    string? Email,
    string Funcao,
    bool Ativo,
    DateTime CriadoEm);

public class UsuarioEntradaDto
{
    public string NomeUsuario { get; set; } = string.Empty;
    public string? Senha { get; set; }
    public string? Email { get; set; }
    public string Funcao { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
}

public class CredenciaisDto
{
    public string NomeUsuario { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
