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

    public const string PapeisGestao = "Administrador,Gerente";
    public const string PapeisVendas = "Administrador,Gerente,Vendedor";
    public const string PapeisOficina = "Administrador,Gerente,Técnico";
    public const string PapeisClientes = "Administrador,Gerente,Vendedor,Técnico";

    public static bool EhGestao(string? funcao) =>
        funcao is Administrador or Gerente;

    public static bool PodeCriarFuncao(string ator, string alvo)
    {
        if (!EhValida(alvo))
        {
            return false;
        }

        if (ator == Administrador)
        {
            return true;
        }

        return ator == Gerente && alvo is Vendedor or Tecnico;
    }

    public static bool PodeGerenciarUsuario(string ator, string funcaoAlvo)
    {
        if (ator == Administrador)
        {
            return true;
        }

        return ator == Gerente && funcaoAlvo is Vendedor or Tecnico;
    }
}
