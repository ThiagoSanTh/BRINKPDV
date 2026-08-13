namespace PDV.WebApi.Configuracao;

public class OpcoesJwt
{
    public const string Secao = "Jwt";

    public string Chave { get; set; } = "chave-de-desenvolvimento-brinkpdv-precisa-ter-32-caracteres";
    public string Emissor { get; set; } = "BRINKPDV";
    public string Audiencia { get; set; } = "BRINKPDV";
    public int HorasValidade { get; set; } = 12;
}
