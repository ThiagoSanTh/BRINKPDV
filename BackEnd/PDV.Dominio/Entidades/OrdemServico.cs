namespace PDV.Dominio.Entidades;

public class OrdemServico
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Numero { get; set; } = string.Empty;
    public string? ClienteId { get; set; }
    public string Cliente { get; set; } = string.Empty;
    public string ContatoCliente { get; set; } = string.Empty;
    public string TipoAparelho { get; set; } = TiposAparelho.Smartphone;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Aparelho { get; set; } = string.Empty;
    public string EstadoAparelho { get; set; } = EstadosAparelho.Bom;
    public string Problema { get; set; } = string.Empty;
    public string Status { get; set; } = StatusOrdemServico.Orcamento;
    public string Prioridade { get; set; } = PrioridadesOrdemServico.Media;
    public decimal Valor { get; set; }
    public List<ItemOrdemServico> Itens { get; set; } = [];
    public DateOnly Data { get; set; } = DateOnly.FromDateTime(DateTime.Today);
    public DateOnly Prazo { get; set; } = DateOnly.FromDateTime(DateTime.Today.AddDays(7));
    public DateOnly? DataSaida { get; set; }

    public Cliente? CadastroCliente { get; set; }

    public string DescricaoAparelho =>
        string.IsNullOrWhiteSpace(Aparelho)
            ? $"{Marca} {Modelo}".Trim()
            : Aparelho;
}

public static class StatusOrdemServico
{
    public const string Orcamento = "Orçamento";
    public const string AguardandoAprovacao = "Aguardando aprovação";
    public const string EmAndamento = "Em Andamento";
    public const string AguardandoPeca = "Aguardando peça";
    public const string ProntoParaRetirada = "Pronto para retirada";
    public const string Entregue = "Entregue";
    public const string Cancelada = "Cancelada";

    public static readonly string[] Todos =
    [
        Orcamento,
        AguardandoAprovacao,
        EmAndamento,
        AguardandoPeca,
        ProntoParaRetirada,
        Entregue,
        Cancelada,
    ];

    public static bool EhValido(string status) => Todos.Contains(Normalizar(status)) || status == "Concluída";

    public static string Normalizar(string? status)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return Orcamento;
        }

        var limpo = status.Trim();

        if (limpo == "Concluída")
        {
            return Entregue;
        }

        var encontrado = Todos.FirstOrDefault(item => string.Equals(item, limpo, StringComparison.OrdinalIgnoreCase));
        return encontrado ?? limpo;
    }

    public static bool EstaEncerrada(string status) =>
        status is Entregue or Cancelada or "Concluída";
}

public static class PrioridadesOrdemServico
{
    public const string Baixa = "Baixa";
    public const string Media = "Média";
    public const string Alta = "Alta";

    public static readonly string[] Todas =
    [
        Baixa,
        Media,
        Alta,
    ];

    public static bool EhValida(string prioridade) => Todas.Contains(prioridade);
}

public static class TiposAparelho
{
    public const string Smartphone = "Smartphone";
    public const string Tablet = "Tablet";
    public const string Notebook = "Notebook";
    public const string Videogame = "Videogame/Console";
    public const string Smartwatch = "Smartwatch";
    public const string Fone = "Fone/Headset";
    public const string TvMonitor = "TV/Monitor";
    public const string Camera = "Câmera";
    public const string Controle = "Controle";
    public const string Outro = "Outro";

    public static readonly string[] Todos =
    [
        Smartphone,
        Tablet,
        Notebook,
        Videogame,
        Smartwatch,
        Fone,
        TvMonitor,
        Camera,
        Controle,
        Outro,
    ];

    public static bool EhValido(string tipo) => Todos.Contains(tipo);
}

public static class EstadosAparelho
{
    public const string SemMarcas = "Sem marcas";
    public const string Bom = "Bom";
    public const string Arranhado = "Arranhado";
    public const string Trincado = "Trincado";
    public const string Quebrado = "Quebrado";
    public const string Molhado = "Molhado";
    public const string NaoLiga = "Não liga";

    public static readonly string[] Todos =
    [
        SemMarcas,
        Bom,
        Arranhado,
        Trincado,
        Quebrado,
        Molhado,
        NaoLiga,
    ];

    public static bool EhValido(string estado) => Todos.Contains(estado);
}

public static class MarcasAparelho
{
    public static readonly string[] Sugestoes =
    [
        "Apple",
        "Samsung",
        "Motorola",
        "Xiaomi",
        "LG",
        "Sony",
        "Microsoft",
        "Nintendo",
        "Asus",
        "Lenovo",
        "Dell",
        "HP",
        "Positivo",
        "Multilaser",
        "JBL",
        "Outra",
    ];
}
