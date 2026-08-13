namespace PDV.Dominio.Entidades;

public class Usuario
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string NomeUsuario { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Funcao { get; set; } = FuncoesUsuario.Vendedor;
    public bool Ativo { get; set; } = true;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}

public static class FuncoesUsuario
{
    public const string Administrador = "Administrador";
    public const string Gerente = "Gerente";
    public const string Vendedor = "Vendedor";
    public const string Tecnico = "Técnico";

    public static readonly string[] Todas =
    [
        Administrador,
        Gerente,
        Vendedor,
        Tecnico,
    ];

    public static bool EhValida(string funcao) => Todas.Contains(funcao);
}
