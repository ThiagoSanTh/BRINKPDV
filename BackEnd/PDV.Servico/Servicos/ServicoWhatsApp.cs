using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using PDV.Dominio.Entidades;
using PDV.Dominio.Repositorios;
using PDV.Servico.Dtos;
using PDV.Servico.Interfaces;

namespace PDV.Servico.Servicos;

public class ServicoWhatsApp : IServicoWhatsApp
{
    private readonly IRepositorioConfiguracaoLoja _repositorio;
    private readonly HttpClient _http;

    public ServicoWhatsApp(IRepositorioConfiguracaoLoja repositorio, HttpClient http)
    {
        _repositorio = repositorio;
        _http = http;
    }

    public async Task<ResultadoWhatsAppDto> NotificarAsync(
        OrdemServico ordem,
        string evento,
        CancellationToken cancelamento = default)
    {
        var texto = MontarMensagem(ordem, evento);
        var destino = TelefoneCliente.ParaWhatsApp(ordem.ContatoCliente);
        var url = string.IsNullOrWhiteSpace(destino)
            ? null
            : $"https://wa.me/{destino}?text={Uri.EscapeDataString(texto)}";

        if (string.IsNullOrWhiteSpace(destino) || !TelefoneCliente.EhValido(ordem.ContatoCliente))
        {
            return new ResultadoWhatsAppDto(false, false, url, texto);
        }

        var configuracao = await _repositorio.ObterAsync(cancelamento);
        var token = configuracao?.WhatsAppToken;
        var phoneId = configuracao?.WhatsAppPhoneNumberId;
        var configurado = !string.IsNullOrWhiteSpace(token) && !string.IsNullOrWhiteSpace(phoneId);

        if (!configurado)
        {
            return new ResultadoWhatsAppDto(false, false, url, texto);
        }

        try
        {
            using var pedido = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://graph.facebook.com/v21.0/{phoneId}/messages");
            pedido.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            pedido.Content = new StringContent(
                JsonSerializer.Serialize(new
                {
                    messaging_product = "whatsapp",
                    to = destino,
                    type = "text",
                    text = new { preview_url = false, body = texto },
                }),
                Encoding.UTF8,
                "application/json");

            using var resposta = await _http.SendAsync(pedido, cancelamento);
            var enviado = resposta.IsSuccessStatusCode;
            return new ResultadoWhatsAppDto(enviado, true, enviado ? null : url, texto);
        }
        catch
        {
            return new ResultadoWhatsAppDto(false, true, url, texto);
        }
    }

    public static string MontarMensagem(OrdemServico ordem, string evento)
    {
        _ = evento;
        var saida = ordem.DataSaida.HasValue
            ? $"\nSaída: {ordem.DataSaida.Value:dd/MM/yyyy}"
            : string.Empty;

        return
            $"*BRINKPDV - Ordem de Serviço*\n" +
            $"OS: {ordem.Numero}\n" +
            $"Cliente: {ordem.Cliente}\n" +
            $"Aparelho: {ordem.DescricaoAparelho} ({ordem.TipoAparelho})\n" +
            $"Estado: {ordem.EstadoAparelho}\n" +
            $"Defeito: {ordem.Problema}\n" +
            $"Status do conserto: {ordem.Status}\n" +
            $"Entrada: {ordem.Data:dd/MM/yyyy}" +
            saida;
    }
}
