using System.Text.Json.Serialization;

namespace PDV.Servico.Dtos;

public class ConfiguracaoLojaDto
{
    public string? Id { get; set; }
    public string NomeLoja { get; set; } = "BRINKPDV";
    public string? LogoLoja { get; set; }
    public string? TelefoneLoja { get; set; }
    public string? EnderecoLoja { get; set; }
    public string? RazaoSocial { get; set; }
    public string? Cnpj { get; set; }
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public string? Cep { get; set; }

    public bool ComprovanteIncluirLogo { get; set; } = true;
    public string? ComprovanteCabecalho { get; set; }
    public string? ComprovanteRodape { get; set; }
    public bool ComprovanteMostrarDadosFiscais { get; set; }

    public string? ImpressoraNome { get; set; }
    public string? ImpressoraModelo { get; set; }
    public string? ImpressoraLarguraPapel { get; set; } = "80mm";
    public bool ImpressoraCorteAutomatico { get; set; } = true;

    public bool AlertaEstoqueBaixo { get; set; } = true;
    public bool SomFinalizacao { get; set; }
    public bool ImpressaoAutomatica { get; set; } = true;

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? WhatsAppToken { get; set; }
    public string? WhatsAppPhoneNumberId { get; set; }
    public bool WhatsAppConfigurado { get; set; }
}
